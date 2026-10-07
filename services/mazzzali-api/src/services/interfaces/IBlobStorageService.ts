export interface IBlobStorageService {
  healthCheck(): Promise<boolean>;
}