/**
 * Type for the api-secrets config file.
 * Load via a credentials loader — never parse this file blindly.
 */
export interface ApiSecrets {
  service: string
  apiKey: string
  apiSecret: string
}
