import { useApiRequest } from "hooks/api";

export function useSocialsRequest() {
    return useApiRequest<SocialsResponse>("https://api.allansattelbergrivera.com/socials");
}
class SocialsResponse {
    linkedin?: string;
    github?: string;
    email?: string;
    phone?: string;
    stackOverFLow?: string;
}