import { Instrument } from './Instrument';

export interface UserInstrument {
  id: string;
  level: string;
  instrument_id: string;
  instruments: Instrument | null;
}
