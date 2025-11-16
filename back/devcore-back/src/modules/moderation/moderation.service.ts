import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModerationResult } from './interfaces/moderation-result.interface';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private readonly apiKey: string | undefined;
  private readonly apiUrl = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';

  // Umbrales de decisión (esto se puede modificar a nuestro gusto)
  private readonly REJECT_THRESHOLD = 0.9; // 90% toxicidad = rechazar
  private readonly CENSOR_THRESHOLD = 0.6; // 60% toxicidad = censurar
  private readonly REVIEW_THRESHOLD = 0.5; // 50% toxicidad = requiere revisión manual

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PERSPECTIVE_API_KEY');
    
    if (!this.apiKey) {
      this.logger.warn('⚠️ PERSPECTIVE_API_KEY no está configurada. La moderación estará deshabilitada.');
    }
  }

  /**
   * Analiza un feedback usando Perspective API
   * @param text Texto del feedback a analizar
   * @returns Resultado con scores y acción sugerida
   */
  async analyzeFeedback(text: string): Promise<ModerationResult> {
    // Si no hay API key, aprobar por defecto pero marcar para revisión
    if (!this.apiKey) {
      this.logger.warn('Análisis omitido: API key no configurada');
      return this.createFallbackResult();
    }

    
    if (!text || text.trim().length === 0) {
      return this.createCleanResult();
    }

    try {
      this.logger.log(`Analizando feedback: "${text.substring(0, 50)}..."`);

      
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: { text },
          languages: ['es', 'en'], // captura tanto español como ingles
          requestedAttributes: {
            TOXICITY: {},           // general
            SEVERE_TOXICITY: {},    // peligrosa
            INSULT: {},             // insultos
            PROFANITY: {},          // no tengo idea
            THREAT: {},             // amenazas
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // manejar error específico de IP bloqueada 
        if (errorText.includes('API_KEY_IP_ADDRESS_BLOCKED')) {
          this.logger.error(`⛔ API Key bloqueada por restricción de IP. Configura las restricciones en Google Cloud Console.`);
          this.logger.error(`   URL: https://console.cloud.google.com/apis/credentials`);
        } else {
          this.logger.error(`Error en Perspective API: ${response.status} - ${errorText}`);
        }
        
        return this.createFallbackResult();
      }

      const data = await response.json();

      // Extraer scores (vienen como objeto de summaryscore)
      const toxicity = data.attributeScores.TOXICITY?.summaryScore?.value || 0;
      const severeToxicity = data.attributeScores.SEVERE_TOXICITY?.summaryScore?.value || 0;
      const insult = data.attributeScores.INSULT?.summaryScore?.value || 0;
      const profanity = data.attributeScores.PROFANITY?.summaryScore?.value || 0;
      const threat = data.attributeScores.THREAT?.summaryScore?.value || 0;

      // Log de scores para debugging (ya se pueden borrar pero los deje porque q viva el consolelog)
      this.logger.log(`Scores - Toxicity: ${toxicity.toFixed(2)}, Severe: ${severeToxicity.toFixed(2)}, Insult: ${insult.toFixed(2)}`);

      
      const result = this.determineAction({
        toxicity,
        severeToxicity,
        insult,
        profanity,
        threat,
      });

      this.logger.log(`Acción sugerida: ${result.suggestedAction}`);

      return result;

    } catch (error) {
      this.logger.error('Error al llamar Perspective API:', error);
      // En caso de error, aprobar pero marcar para revisión manual
      return this.createFallbackResult();
    }
  }

  
  private determineAction(scores: {
    toxicity: number;
    severeToxicity: number;
    insult: number;
    profanity: number;
    threat: number;
  }): ModerationResult {
    const { toxicity, severeToxicity, insult, profanity, threat } = scores;

    // CASO 1: rechaza si es muy toxico
    if (severeToxicity > this.REJECT_THRESHOLD || threat > this.REJECT_THRESHOLD) {
      return {
        isAppropriate: false,
        toxicityScore: toxicity,
        severeToxicityScore: severeToxicity,
        insultScore: insult,
        profanityScore: profanity,
        threatScore: threat,
        suggestedAction: 'reject',
        requiresManualReview: false,
        reason: 'Contenido severamente tóxico o amenazante detectado. Este tipo de contenido no está permitido.',
      };
    }

    // CASO 2: toxicidad general muy alta rechaza
    if (toxicity > this.REJECT_THRESHOLD || insult > this.REJECT_THRESHOLD) {
      return {
        isAppropriate: false,
        toxicityScore: toxicity,
        severeToxicityScore: severeToxicity,
        insultScore: insult,
        profanityScore: profanity,
        threatScore: threat,
        suggestedAction: 'reject',
        requiresManualReview: false,
        reason: 'Contenido extremadamente ofensivo detectado. Por favor, reformula tu feedback de manera respetuosa.',
      };
    }

    // CASO 3: censura contenido toxico
    if (toxicity > this.CENSOR_THRESHOLD || profanity > this.CENSOR_THRESHOLD || insult > this.CENSOR_THRESHOLD) {
      return {
        isAppropriate: false,
        toxicityScore: toxicity,
        severeToxicityScore: severeToxicity,
        insultScore: insult,
        profanityScore: profanity,
        threatScore: threat,
        suggestedAction: 'censor',
        requiresManualReview: toxicity > this.REVIEW_THRESHOLD,
        reason: 'Contenido potencialmente ofensivo detectado. Se mostrará censurado.',
      };
    }

    // CASO 4: lo revisa al contenido q puede llegar a ser toxico
    if (toxicity > this.REVIEW_THRESHOLD) {
      return {
        isAppropriate: true,
        toxicityScore: toxicity,
        severeToxicityScore: severeToxicity,
        insultScore: insult,
        profanityScore: profanity,
        threatScore: threat,
        suggestedAction: 'approve',
        requiresManualReview: true,
        reason: 'Contenido aprobado pero marcado para revisión manual.',
      };
    }

    // CASO 5: aprueba el contenido limpio
    return {
      isAppropriate: true,
      toxicityScore: toxicity,
      severeToxicityScore: severeToxicity,
      insultScore: insult,
      profanityScore: profanity,
      threatScore: threat,
      suggestedAction: 'approve',
      requiresManualReview: false,
    };
  }

  // si la api no esta disponible
  private createFallbackResult(): ModerationResult {
    return {
      isAppropriate: true,
      toxicityScore: 0,
      severeToxicityScore: 0,
      insultScore: 0,
      profanityScore: 0,
      threatScore: 0,
      suggestedAction: 'approve',
      requiresManualReview: true, 
      reason: 'Análisis no disponible. Marcado para revisión manual.',
    };
  }

  
  private createCleanResult(): ModerationResult {
    return {
      isAppropriate: true,
      toxicityScore: 0,
      severeToxicityScore: 0,
      insultScore: 0,
      profanityScore: 0,
      threatScore: 0,
      suggestedAction: 'approve',
      requiresManualReview: false,
    };
  }
}
