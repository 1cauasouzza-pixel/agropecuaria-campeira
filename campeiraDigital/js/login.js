
/* ============================
   LOGIN - CAMPEIRA DIGITAL
============================ */

const formularioLogin = document.getElementById("form-login");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const mensagemLogin = document.getElementById("mensagem-login");

if (formularioLogin) {
    formularioLogin.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = campoEmail.value.trim().toLowerCase();
        const senha = campoSenha.value;

        mensagemLogin.textContent = "";

        // Consulta os clientes cadastrados
        let clientes = [];

        try {
            const dadosSalvos = localStorage.getItem("clientes");
            clientes = dadosSalvos ? JSON.parse(dadosSalvos) : [];

            if (
                !Array.isArray(clientes) ||
                clientes.some(function (item) {
                    return (
                        item === null ||
                        typeof item !== "object" ||
                        Array.isArray(item)
                    );
                })
            ) {
                throw new Error("Formato de cadastros inválido.");
            }
        } catch (erro) {
            console.error("Erro ao consultar os cadastros:", erro);

            mensagemLogin.textContent =
                "Não foi possível consultar os cadastros.";

            return;
        }

        // Procura o cliente pelo e-mail
        const cliente = clientes.find(function (item) {
            return (
                typeof item.email === "string" &&
                item.email.trim().toLowerCase() === email
            );
        });

        if (!cliente) {
            mensagemLogin.textContent =
                "E-mail não cadastrado. Verifique ou crie uma conta.";

            return;
        }

        // Confere a senha
        if (
            typeof cliente.senha !== "string" ||
            cliente.senha !== senha
        ) {
            mensagemLogin.textContent =
                "Senha incorreta. Tente novamente.";

            return;
        }

        // Verifica se o cliente possui identificador
        if (
            cliente.id === undefined ||
            cliente.id === null ||
            !cliente.nome
        ) {
            mensagemLogin.textContent =
                "Cadastro incompleto. Entre em contato com o atendimento.";

            return;
        }

        // Cria a sessão do usuário
        try {
            sessionStorage.setItem(
                "usuarioLogado",
                JSON.stringify({
                    id: cliente.id,
                    nome: cliente.nome,
                    email: cliente.email,
                    tipo: "cliente"
                })
            );
        } catch (erro) {
            console.error("Erro ao iniciar sessão:", erro);

            mensagemLogin.textContent =
                "Não foi possível iniciar sua sessão.";

            return;
        }

        // Redireciona para a página inicial
        window.location.href = "../paginas publicas/index.html";
    });
}
