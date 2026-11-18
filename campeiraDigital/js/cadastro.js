
// ============================
// CADASTRO DE CLIENTES
// CAMPEIRA DIGITAL
// ============================

const formulario = document.getElementById("form-cadastro");
const mensagemCadastro = document.getElementById("mensagem-cadastro");

// Valida os dígitos verificadores do CPF
function validarCPF(cpf) {
    if (!/^\d{11}$/.test(cpf)) {
        return false;
    }

    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }

    let primeiroDigito = (soma * 10) % 11;

    if (primeiroDigito === 10) {
        primeiroDigito = 0;
    }

    if (primeiroDigito !== Number(cpf[9])) {
        return false;
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }

    let segundoDigito = (soma * 10) % 11;

    if (segundoDigito === 10) {
        segundoDigito = 0;
    }

    return segundoDigito === Number(cpf[10]);
}

// Exibe mensagens na página
function exibirMensagem(texto, sucesso = false) {
    if (mensagemCadastro) {
        mensagemCadastro.textContent = texto;
        mensagemCadastro.style.color = sucesso ? "green" : "red";
    } else {
        alert(texto);
    }
}

if (formulario) {
    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        exibirMensagem("");

        // 1. Captura os dados do formulário
        const nome = document.getElementById("nome").value.trim();
        const cpf = document.getElementById("cpf").value.replace(/\D/g, "");
        const telefone = document.getElementById("telefone").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const senha = document.getElementById("senha").value;
        const confirmarSenha = document.getElementById("confirmar-senha").value;
        const endereco = document.getElementById("endereco").value.trim();
        const numero = document.getElementById("numero").value.trim();
        const bairro = document.getElementById("bairro").value.trim();

        // 2. Valida os campos obrigatórios
        if (
            !nome || !cpf || !telefone || !email || !senha ||
            !confirmarSenha || !endereco || !numero || !bairro
        ) {
            exibirMensagem("Preencha todos os campos.");
            return;
        }

        // 3. Verifica as senhas
        if (senha !== confirmarSenha) {
            exibirMensagem("As senhas não são iguais.");
            return;
        }

        if (senha.length < 8) {
            exibirMensagem("A senha deve ter pelo menos 8 caracteres.");
            return;
        }

        // 4. Valida o CPF
        if (!validarCPF(cpf)) {
            exibirMensagem("Informe um CPF válido.");
            return;
        }

        // 5. Recupera os clientes cadastrados
        let clientes = [];

        try {
            const dadosSalvos = localStorage.getItem("clientes");

            clientes = dadosSalvos ? JSON.parse(dadosSalvos) : [];

            if (
                !Array.isArray(clientes) ||
                clientes.some(function (cliente) {
                    return (
                        cliente === null ||
                        typeof cliente !== "object" ||
                        Array.isArray(cliente)
                    );
                })
            ) {
                throw new Error("Formato de cadastros inválido.");
            }
        } catch (erro) {
            console.error("Erro ao carregar cadastros:", erro);
            exibirMensagem("Não foi possível consultar os cadastros salvos.");
            return;
        }

        // 6. Verifica CPF duplicado
        const cpfExiste = clientes.some(function (cliente) {
            return (
                typeof cliente.cpf === "string" &&
                cliente.cpf.replace(/\D/g, "") === cpf
            );
        });

        if (cpfExiste) {
            exibirMensagem("Este CPF já está cadastrado.");
            return;
        }

        // 7. Verifica e-mail duplicado
        const emailExiste = clientes.some(function (cliente) {
            return (
                typeof cliente.email === "string" &&
                cliente.email.trim().toLowerCase() === email
            );
        });

        if (emailExiste) {
            exibirMensagem("Este e-mail já está cadastrado.");
            return;
        }

        // 8. Cria o novo cliente
        const novoCliente = {
            id: Date.now(),
            nome: nome,
            cpf: cpf,
            telefone: telefone,
            email: email,
            senha: senha,
            endereco: endereco,
            numero: numero,
            bairro: bairro,
            tipo: "cliente"
        };

        // 9. Salva o cadastro
        clientes.push(novoCliente);

        try {
            localStorage.setItem("clientes", JSON.stringify(clientes));
        } catch (erro) {
            console.error("Erro ao salvar cadastro:", erro);
            exibirMensagem("Não foi possível salvar o cadastro no navegador.");
            return;
        }

        // 10. Confirma e redireciona
        exibirMensagem(
            "Cadastro realizado com sucesso! Redirecionando para o login...",
            true
        );

        formulario.reset();

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1500);
    });
}
