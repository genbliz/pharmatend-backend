import { ICoreEntityBaseModel } from "@/core/base-types";

export interface ICachedData extends ICoreEntityBaseModel {
  targetId: string;
  dateControlEnc: string;
  dataEncoded: string;
  category: string;
}
