export const API_BASE_URL = "http://localhost:5000/api/auth";

export const apiRequest = async(endpoint:string, method:string, body?:any) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method,
            headers:{
                'Content-Type': 'application/json',
            },
            body: body? JSON.stringify(body): undefined,
        })
        const data = await response.json();
        console.log(data);
        
        if(!response.ok){
            throw new Error(data.message || 'Something went wrong');
        }
        return data;
    } catch (error:any) {
        throw new Error(error.message)
    }
};