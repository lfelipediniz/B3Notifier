import axios from "axios";

// conexao com o backend 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// config base do axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    transformResponse: [(data) => {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error("Erro tentando parsear JSON da resposta:", data);
        return data;
      }
    }]
  });
  // intercepta as requisicoes para adicionar o token JWT
  api.interceptors.request.use((config) => {
    // lista de rotas que NÃO precisam de autenticação
    const publicRoutes = ["/user/send-otp/", "/user/verify-otp/", "/user/register/", "/token/"];
    // se a URL da requisição estiver na lista de rotas públicas, remove o token
    if (!publicRoutes.some(route => config.url.includes(route))) {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    // console.log("Requisição: ", config.url, config.headers.Authorization);
    return config;
});


// salva os tokens no localStorage e no axios
const storeTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
};

// trata as requets pra capturar os erros
const handleRequest = async (requestFn, data) => {
      const response = await requestFn(data);
  
      // se response.data for undefined, acessa o response diretamente
      const responseData = response.data || response;
  
      return responseData;
    
  };
  

// envia email pro usuario com o codigo OTP
export const sendOTP = async ({ email }) => {
  return handleRequest((data) => api.post("/user/send-otp/", data), { email });
};

// verifica o codigo OTP inserido pelo usuario
export const verifyOTP = async ({ email, otp }) => {
  return handleRequest((data) => api.post("/user/verify-otp/", data), { email, otp });
};

// cria ou atualiza a conta do usuario
export const registerUser = async ({ username, email, password, confirmPassword }) => {
    return api.post("/user/register/", {
      username,
      email,
      password,
      confirm_password: confirmPassword, 
    });
  };
// faz login e captura o JWT token
export const loginUser = async ({ username, password }) => {
    return handleRequest(async () => {
      const response = await api.post("/token/", { username, password });
    
      storeTokens(response.data.access, response.data.refresh);
      return response.data;
    });
  };
  

// logout (remove os tokens do localStorage)
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  delete api.defaults.headers.common["Authorization"];
};

// captura os dados do usuário logado
export const getUserProfile = async () => {
  return handleRequest(() => api.get("/user/profile/"));
};

// busca os ativos monitorados do usuario
export const getStocks = async () => {
  return handleRequest(() => api.get("/stock/list/"));
};

// adiciona um novo ativo ao monitoramento
export const addStock = async (data) => {
  return handleRequest(() => api.post("/stock/create/", data));
};

// captura dados um ativo antes diretamente do yahoo finance
export const fetchStockQuote = async (name, periodicity) => {
  return handleRequest(() => api.get(`/stock/quote/?name=${name}&periodicity=${periodicity}`));
};

// atualiza os dados de um ativo
export const updateStock = async (id, data) => {
  return handleRequest(() => api.put(`/stock/update/${id}/`, data));
};

// apaga um ativo do monitoramento
export const deleteStock = async (id) => {
  return handleRequest(() => api.delete(`/stock/delete/${id}/`));
};

// captura info sobre a ultima e a proxima atualizcao dos ativos
export const getStockUpdatesInfo = async () => {
  return handleRequest(() => api.get("/stocks/updates-info/"));
};


export default api;
