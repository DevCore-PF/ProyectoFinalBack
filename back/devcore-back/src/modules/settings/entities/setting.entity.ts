import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('settings')
export class Setting {
    @PrimaryColumn({type: 'varchar', length: 100})
    key: string;

    //este sera el valor de la configuracion
    @Column({type: 'varchar', length: 255})
    value: string; //24-48 o 72 horas

    
}