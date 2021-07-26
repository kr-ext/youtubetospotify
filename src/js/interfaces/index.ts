interface Token {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

interface DialogBehavior {
  autoHide: boolean;
  hideTimeout?: number;
}

interface DialogMessage {
  title: string;
  text?: string;
  link?: { href: string; text: string };
  image?: { url: string };
}
interface DialogConfirmation {
  text: string;
  data: any;
  dataType: string;
}

interface Dialog {
  behavior: DialogBehavior;
  message: DialogMessage;
  confirmation?: DialogConfirmation;
  showDonation?: boolean;
}
interface TrackObject {
  track: string;
  artist: string;
}

interface TrackResponseObject {
  track: TrackObject;
  success: boolean;
  errMessage: string;
  pageName: string;
}

export {
  Token,
  Dialog,
  DialogBehavior,
  DialogMessage,
  TrackObject,
  TrackResponseObject,
};
