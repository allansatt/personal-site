import { useState } from "react";

export function useApiRequest<T>(
    url: string,
    options?: RequestInit
    ){
        const [isLoading, setIsLoading] = useState<boolean>(true);
        const [data, setData] = useState<T | null>(null);
        const [error, setError] = useState<Error | null>(null);
        const [triggered, setTriggeret] = useState<boolean>(false);
        if(!triggered){
            setTriggeret(true);
            fetch(url, options)
            .then((res) => {
                return res.json()
            })
            .then((data) => {
                setData(data);
                setIsLoading(false);
            }).catch((error) => {
                setError(error);
                setIsLoading(false);
            });
        }
        return { isLoading, data, error };
}