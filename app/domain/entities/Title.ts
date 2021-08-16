export type TitleStatus = "queued" | "error" | "complete";
export interface Title {
  id?: string;
  text: string;
  shortTitle?: string;
  status: TitleStatus;
  hash: string;
}

export class TitleDto implements Title {
  public id?: string;
  public text: string;
  public shortTitle?: string;
  public status: TitleStatus;
  public hash: string;

  constructor(title: Title) {
    this.id = title.id;
    this.text = title.text;
    this.shortTitle = title.shortTitle;
    this.status = title.status;
    this.hash = title.hash;
  }
}
