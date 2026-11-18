
// ========================================
// SERVIÇOS INICIAIS
// ========================================

function servicosIniciais() {
    return [
        {
            id: 1,
            nome: "Banho e tosa",
            descricao: "Serviço de higiene e cuidados para animais.",
            categoria: "Cuidados com animais"
        },
        {
            id: 2,
            nome: "Atendimento veterinário",
            descricao: "Atendimento voltado aos cuidados e à saúde dos animais.",
            categoria: "Saúde animal"
        },
        {
            id: 3,
            nome: "Orientação sobre alimentação",
            descricao: "Orientações sobre produtos e alimentação adequada para os animais.",
            categoria: "Orientação"
        }
    ];
}


// ========================================
// CARREGAR SERVIÇOS
// ========================================

let servicos = [];
let erroAoCarregarServicos = false;

try {
    const dadosSalvos = localStorage.getItem("servicos");

    const dados = dadosSalvos === null
        ? servicosIniciais()
        : JSON.parse(dadosSalvos);

    if (!Array.isArray(dados) || dados.some(function (servico) {
        return servico === null ||
            typeof servico !== "object" ||
            Array.isArray(servico) ||
            typeof servico.nome !== "string";
    })) {
        throw new Error("Os serviços salvos possuem um formato inválido.");
    }

    servicos = dados.map(function (servico) {
        return {
            ...servico,
            nome: servico.nome.trim(),
            descricao: typeof servico.descricao === "string"
                ? servico.descricao
                : "",
            categoria: typeof servico.categoria === "string"
                ? servico.categoria
                : "Serviço"
        };
    });

    if (dadosSalvos === null) {
        localStorage.setItem("servicos", JSON.stringify(servicos));
    }

} catch (erro) {
    console.error("Não foi possível carregar os serviços:", erro);
    erroAoCarregarServicos = true;
}


// ========================================
// ELEMENTO DA LISTA
// ========================================

const listaServicos = document.getElementById("lista-servicos");


// ========================================
// MOSTRAR SERVIÇOS
// ========================================

function mostrarServicos() {
    if (!listaServicos) {
        return;
    }

    listaServicos.replaceChildren();

    if (erroAoCarregarServicos) {
        listaServicos.textContent =
            "Não foi possível carregar os serviços salvos. Verifique os dados do navegador.";
        return;
    }

    if (servicos.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.textContent = "Nenhum serviço disponível.";

        listaServicos.appendChild(mensagem);
        return;
    }

    servicos.forEach(function (servico) {

        const artigo = document.createElement("article");
        artigo.classList.add("card-servico");

        // IMAGEM E ÍCONE
        const imagem = document.createElement("div");
        imagem.classList.add("servico-imagem");
        imagem.setAttribute("aria-hidden", "true");

        const icone = document.createElement("span");

        const iconesCategorias = {
            "Cuidados com animais": "🐕",
            "Saúde animal": "🩺",
            "Orientação": "🌿"
        };

        icone.textContent =
            iconesCategorias[servico.categoria] || "🐾";

        imagem.appendChild(icone);

        // INFORMAÇÕES
        const informacoes = document.createElement("div");
        informacoes.classList.add("servico-info");

        const categoria = document.createElement("span");
        categoria.classList.add("categoria-servico");
        categoria.textContent = servico.categoria || "Serviço";

        const nome = document.createElement("h3");
        nome.textContent = servico.nome || "Serviço sem nome";

        const descricao = document.createElement("p");
        descricao.textContent =
            servico.descricao || "Descrição não informada.";

        // BOTÃO DE AGENDAMENTO
        const botao = document.createElement("a");

        botao.href = "agendamento.html";
        botao.classList.add("botao-servico");
        botao.textContent = "Agendar serviço";

        informacoes.append(
            categoria,
            nome,
            descricao,
            botao
        );

        artigo.append(imagem, informacoes);

        listaServicos.appendChild(artigo);
    });
}


// ========================================
// INICIALIZAÇÃO
// ========================================

mostrarServicos();
