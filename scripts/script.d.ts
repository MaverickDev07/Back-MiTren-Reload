import { EventEmitter } from 'events';
import { SerialPort } from 'serialport';

// Interfaces para los tipos de datos
interface TubeStatus {
    tubeStatus: {
        [key: number]: number;
    };
    total: number;
}

interface PaymentCompletedData {
    message: string;
    totalPaid: string;
    change: string | null;
}

interface TubeStatusEvent {
    total: number;
    acceptedBills: number[];
}

// Comandos
interface Commands {
    BillEnables: number[];
    Status: number[];
    AcceptBill: number[];
    RejectBill: number[];
    InhibitBills: number[];
    DesinhibitBilletero: number[];
    BilleteroEnEspera: number[];
    Enable10: number[];
    Enable10_20: number[];
    Enable10_20_50: number[];
    Enable10_20_50_100: number[];
    Enable10_20_50_100_200: number[];
    EnableAll: number[];
    EnableMonedero: number[];
    InhibitMonedero: number[];
    TubeStatus: number[];
    PullMonedero: number[];
    Cambio10Ctvs: number[];
    Cambio20Ctvs: number[];
    Cambio50Ctvs: number[];
    Cambio1Bs: number[];
    Cambio1_50Bs: number[];
    Cambio2Bs: number[];
    Cambio2_50Bs: number[];
    Cambio3Bs: number[];
}

// Declaración del módulo
declare module './script' {
    // Exportaciones
    export const eventEmitter: EventEmitter & {
        on(event: 'tubeStatus', listener: (data: TubeStatusEvent) => void): this;
        on(event: 'paymentCompleted', listener: (data: PaymentCompletedData) => void): this;
        once(event: 'tubeStatus', listener: (data: TubeStatusEvent) => void): this;
        once(event: 'paymentCompleted', listener: (data: PaymentCompletedData) => void): this;
    };
    
    export function requestAmount(amount: number): void;
}