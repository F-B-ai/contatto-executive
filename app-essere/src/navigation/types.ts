// App ESSĒRE - Navigation Types
import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Titolare Stack (Owner)
export type TitolareTabParamList = {
  Dashboard: undefined;
  Calendario: undefined;
  Collaboratori: undefined;
  Allievi: undefined;
  Economia: undefined;
  Altro: undefined;
};

export type TitolareStackParamList = {
  TitolareTabs: NavigatorScreenParams<TitolareTabParamList>;
  // Dettagli
  CollaboratoreDetail: { id: string };
  AllievoDetail: { id: string };
  SessioneDetail: { id: string };
  ProgrammaDetail: { id: string };
  // Creazione/Modifica
  NuovoCollaboratore: undefined;
  NuovoAllievo: { collaboratoreId?: string };
  NuovaSessione: { allievoId?: string; collaboratoreId?: string };
  NuovoProgramma: undefined;
  NuovoEsercizio: undefined;
  NuovaSpesa: undefined;
  NuovoContenuto: undefined;
  // Altri
  Chat: { conversazioneId?: string; partecipanteId?: string };
  TestPosturale: { allievoId: string };
  Profilo: undefined;
  Impostazioni: undefined;
};

// Collaboratore Stack (Trainer)
export type CollaboratoreTabParamList = {
  Home: undefined;
  Calendario: undefined;
  Allievi: undefined;
  Economia: undefined;
  Altro: undefined;
};

export type CollaboratoreStackParamList = {
  CollaboratoreTabs: NavigatorScreenParams<CollaboratoreTabParamList>;
  AllievoDetail: { id: string };
  SessioneDetail: { id: string };
  ProgrammaDetail: { id: string };
  NuovaSessione: { allievoId?: string };
  NuovoProgramma: undefined;
  Chat: { conversazioneId?: string; partecipanteId?: string };
  TestPosturale: { allievoId: string };
  Profilo: undefined;
  Impostazioni: undefined;
};

// Allievo Stack (Client)
export type AllievoTabParamList = {
  Home: undefined;
  Programma: undefined;
  Calendario: undefined;
  Contenuti: undefined;
  Altro: undefined;
};

export type AllievoStackParamList = {
  AllievoTabs: NavigatorScreenParams<AllievoTabParamList>;
  SessioneDetail: { id: string };
  EsercizioDetail: { id: string };
  ContenutoDetail: { id: string };
  Chat: { conversazioneId?: string };
  Diario: undefined;
  NuovaDiarioEntry: undefined;
  Pagamenti: undefined;
  TestPosturali: undefined;
  Profilo: undefined;
  Impostazioni: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Titolare: NavigatorScreenParams<TitolareStackParamList>;
  Collaboratore: NavigatorScreenParams<CollaboratoreStackParamList>;
  Allievo: NavigatorScreenParams<AllievoStackParamList>;
};

// Declare global for useNavigation hook typing
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
