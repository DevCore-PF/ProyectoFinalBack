/**
 * Resultado del análisis de moderación de Perspective API
 */
export interface ModerationResult {
  /**
   * Si el contenido es apropiado para mostrar sin restricciones
   */
  isAppropriate: boolean;

  /**
   * Score de toxicidad general (0.0 a 1.0)
   * 0.0 = no es toxico, 1.0 = mega toxico
   */
  toxicityScore: number;

  /**
   * Score de toxicidad severa (0.0 a 1.0)
   */
  severeToxicityScore: number;

  /**
   * Score de insultos (0.0 a 1.0)
   */
  insultScore: number;

  /**
   * Score de profanidad/groserías (0.0 a 1.0)
   */
  profanityScore: number;

  /**
   * Score de amenazas (0.0 a 1.0)
   */
  threatScore: number;

  /**
   * Razón por la cual fue marcado (si aplica)
   */
  reason?: string;

  /**
   * Acción sugerida basada en los scores
   * - approve: lo muestra normal
   * - censor: lo muestra censurado 
   * - reject: muy toxico no lo guarda
   */
  suggestedAction: 'approve' | 'censor' | 'reject';

  /**
   * Si debe marcarse para revisión manual por admin
   */
  requiresManualReview: boolean;
}
