
// ========================================
// ELEMENTOS DO HTML
// ========================================

const listaCarrinho = document.getElementById("lista-carrinho");
const totalElemento = document.getElementById("total");
const botaoFinalizar = document.getElementById("finalizar-pedido");
const enderecoEntrega = document.getElementById("endereco-entrega");


// ========================================
// CARREGAR CARRINHO
// ========================================

function carregarCarrinho() {
    try {
        const dados = JSON.parse(
            localStorage.getItem("carrinho") || "[]"
        );

        if (!Array.isArray(dados)) {
            throw new Error("Os dados do carrinho não são uma lista.");
        }

        const itensValidos = dados.filter(function (item) {
            return item !== null &&
                typeof item === "object" &&
                !Array.isArray(item) &&
                item.id !== undefined;
        });

        const itens = itensValidos.map(function (item) {
            const quantidade = Number(item.quantidade);
            const preco = Number(item.preco);

            return {
                ...item,
                nome: typeof item.nome === "string"
                    ? item.nome
                    : "Produto sem nome",

                descricao: typeof item.descricao === "string"
                    ? item.descricao
                    : "",

                preco: Number.isFinite(preco) && preco >= 0
                    ? preco
                    : 0,

                quantidade: Number.isInteger(quantidade) &&
                    quantidade > 0
                    ? quantidade
                    : 1,

                imagem: typeof item.imagem === "string"
                    ? item.imagem
                    : ""
            };
        });

        return {
            itens: itens,
            erro: itensValidos.length !== dados.length
        };

    } catch (erro) {
        console.error("Erro ao carregar carrinho:", erro);

        return {
            itens: [],
            erro: true
        };
    }
}

const resultadoCarrinho = carregarCarrinho();
let carrinho = resultadoCarrinho.itens;


// ========================================
// SALVAR CARRINHO
// ========================================

function salvarCarrinho() {
    try {
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        resultadoCarrinho.erro = false;
        return true;

    } catch (erro) {
        console.error("Erro ao salvar carrinho:", erro);
        alert("Não foi possível salvar as alterações no carrinho.");
        return false;
    }
}


// ========================================
// FORMATAR PREÇO
// ========================================

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// ========================================
// CONSULTAR PRODUTOS
// ========================================

function consultarProduto(idProduto) {
    try {
        const produtos = JSON.parse(
            localStorage.getItem("produtos") || "[]"
        );

        if (!Array.isArray(produtos)) {
            throw new Error("Os produtos salvos não são uma lista.");
        }

        return produtos.find(function (produto) {
            return produto !== null &&
                typeof produto === "object" &&
                String(produto.id) === String(idProduto);
        });

    } catch (erro) {
        console.error("Erro ao consultar produtos:", erro);
        return undefined;
    }
}


function consultarEstoque(idProduto) {
    const produto = consultarProduto(idProduto);

    if (!produto) {
        return undefined;
    }

    const estoque = Number(produto.estoque);

    if (!Number.isInteger(estoque) || estoque < 0) {
        return undefined;
    }

    return estoque;
}


function quantidadeNoCarrinho(idProduto, indiceIgnorado) {
    return carrinho.reduce(function (total, item, indice) {
        if (
            indice === indiceIgnorado ||
            String(item.id) !== String(idProduto)
        ) {
            return total;
        }

        return total + item.quantidade;
    }, 0);
}


// ========================================
// IMAGEM ALTERNATIVA
// ========================================

function criarPlaceholderImagem() {
    const placeholder = document.createElement("span");

    placeholder.className = "imagem-carrinho-placeholder";
    placeholder.textContent = "📦";
    placeholder.setAttribute("aria-hidden", "true");

    return placeholder;
}


// ========================================
// MOSTRAR CARRINHO
// ========================================

function mostrarCarrinho() {
    if (!listaCarrinho || !totalElemento) {
        return;
    }

    listaCarrinho.replaceChildren();

    if (resultadoCarrinho.erro) {
        const aviso = document.createElement("p");

        aviso.setAttribute("role", "status");
        aviso.textContent =
            "Alguns dados do carrinho estavam inválidos e foram ignorados.";

        listaCarrinho.appendChild(aviso);
    }

    if (carrinho.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.textContent = "Seu carrinho está vazio.";

        listaCarrinho.appendChild(mensagem);
        totalElemento.textContent = formatarMoeda(0);

        return;
    }

    let total = 0;

    carrinho.forEach(function (produto, indice) {
        const subtotal = produto.preco * produto.quantidade;
        total += subtotal;

        const item = document.createElement("article");
        item.classList.add("item-carrinho");

        // IMAGEM
        const produtoVisual = document.createElement("div");
        produtoVisual.className = "item-carrinho-produto";

        const areaImagem = document.createElement("div");
        areaImagem.className = "imagem-carrinho";

        const produtoCadastrado = consultarProduto(produto.id);

        const caminhoImagem = produto.imagem ||
            (produtoCadastrado && produtoCadastrado.imagem);

        if (caminhoImagem && caminhoImagem.trim()) {
            const imagem = document.createElement("img");

            imagem.src = caminhoImagem;
            imagem.alt = produto.nome;
            imagem.loading = "lazy";

            imagem.onerror = function () {
                areaImagem.replaceChildren(criarPlaceholderImagem());
            };

            areaImagem.appendChild(imagem);

        } else {
            areaImagem.appendChild(criarPlaceholderImagem());
        }

        // INFORMAÇÕES
        const informacoes = document.createElement("div");
        informacoes.className = "item-carrinho-info";

        const nome = document.createElement("h3");
        nome.textContent = produto.nome;

        const descricao = document.createElement("p");
        descricao.textContent = produto.descricao;

        const precoUnitario = document.createElement("p");
        precoUnitario.textContent =
            "Preço unitário: " + formatarMoeda(produto.preco);

        const subtotalElemento = document.createElement("p");
        subtotalElemento.textContent =
            "Subtotal: " + formatarMoeda(subtotal);

        // QUANTIDADE
        const labelQuantidade = document.createElement("label");
        labelQuantidade.textContent = "Quantidade: ";

        const campoQuantidade = document.createElement("input");

        campoQuantidade.type = "number";
        campoQuantidade.min = "1";
        campoQuantidade.step = "1";
        campoQuantidade.value = produto.quantidade;

        campoQuantidade.setAttribute(
            "aria-label",
            "Quantidade de " + produto.nome
        );

        campoQuantidade.addEventListener("change", function () {
            alterarQuantidade(indice, campoQuantidade.value);
        });

        labelQuantidade.appendChild(campoQuantidade);

        // REMOVER
        const botaoRemover = document.createElement("button");

        botaoRemover.type = "button";
        botaoRemover.textContent = "Remover";

        botaoRemover.addEventListener("click", function () {
            removerProduto(indice);
        });

        informacoes.append(
            nome,
            descricao,
            precoUnitario,
            subtotalElemento
        );

        produtoVisual.append(areaImagem, informacoes);

        item.append(
            produtoVisual,
            labelQuantidade,
            botaoRemover
        );

        listaCarrinho.appendChild(item);
    });

    totalElemento.textContent = formatarMoeda(total);
}


// ========================================
// ALTERAR QUANTIDADE
// ========================================

function alterarQuantidade(indice, valorInformado) {
    const produtoCarrinho = carrinho[indice];
    const quantidade = Number(valorInformado);

    if (!produtoCarrinho) {
        return;
    }

    if (!Number.isInteger(quantidade) || quantidade < 1) {
        alert("Informe uma quantidade inteira maior que zero.");
        mostrarCarrinho();
        return;
    }

    const estoqueDisponivel = consultarEstoque(produtoCarrinho.id);

    if (estoqueDisponivel === undefined) {
        alert("Este produto não foi encontrado no cadastro.");
        mostrarCarrinho();
        return;
    }

    const restante = estoqueDisponivel -
        quantidadeNoCarrinho(produtoCarrinho.id, indice);

    if (quantidade > restante) {
        alert(
            "Estoque insuficiente. Disponível para este item: " +
            Math.max(0, restante) + " unidade(s)."
        );

        mostrarCarrinho();
        return;
    }

    const quantidadeAnterior = produtoCarrinho.quantidade;

    produtoCarrinho.quantidade = quantidade;

    if (!salvarCarrinho()) {
        produtoCarrinho.quantidade = quantidadeAnterior;
    }

    mostrarCarrinho();
}


// ========================================
// REMOVER PRODUTO
// ========================================

function removerProduto(indice) {
    if (!carrinho[indice]) {
        return;
    }

    const removido = carrinho.splice(indice, 1)[0];

    if (!salvarCarrinho()) {
        carrinho.splice(indice, 0, removido);
    }

    mostrarCarrinho();
}


// ========================================
// FORMA DE RECEBIMENTO
// ========================================

const opcoesRecebimento = document.querySelectorAll(
    'input[name="recebimento"]'
);

function atualizarEnderecoEntrega() {
    const opcaoSelecionada = document.querySelector(
        'input[name="recebimento"]:checked'
    );

    const entregaSelecionada =
        opcaoSelecionada &&
        opcaoSelecionada.value === "entrega";

    if (enderecoEntrega) {
        enderecoEntrega.style.display =
            entregaSelecionada ? "block" : "none";
    }
}

opcoesRecebimento.forEach(function (opcao) {
    opcao.addEventListener("change", atualizarEnderecoEntrega);
});


// ========================================
// FINALIZAR PEDIDO PELO WHATSAPP
// ========================================

if (botaoFinalizar) {
    botaoFinalizar.addEventListener("click", function () {

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        const produtosPedido = [];
        const quantidadesPorProduto = new Map();

        // CONFERIR ESTOQUE E DADOS ATUAIS
        for (const item of carrinho) {
            if (!Number.isInteger(item.quantidade) ||
                item.quantidade < 1) {

                alert("O carrinho contém uma quantidade inválida.");
                return;
            }

            const id = String(item.id);

            const quantidadeTotal =
                (quantidadesPorProduto.get(id) || 0) + item.quantidade;

            quantidadesPorProduto.set(id, quantidadeTotal);
        }

        for (const [id, quantidade] of quantidadesPorProduto) {
            const produtoAtual = consultarProduto(id);

            if (!produtoAtual) {
                alert("Um dos produtos não está mais cadastrado.");
                return;
            }

            const estoque = Number(produtoAtual.estoque);

            if (!Number.isInteger(estoque) || estoque < quantidade) {
                alert(
                    "Estoque insuficiente para " + produtoAtual.nome +
                    ". Disponível: " +
                    (Number.isInteger(estoque) && estoque >= 0
                        ? estoque
                        : 0) +
                    " unidade(s)."
                );

                return;
            }

            const preco = Number(produtoAtual.preco);

            if (!Number.isFinite(preco) || preco < 0) {
                alert("O preço de um dos produtos está inválido.");
                return;
            }

            produtosPedido.push({
                produto: produtoAtual,
                quantidade: quantidade,
                preco: preco
            });
        }

        // RECEBIMENTO
        const opcaoSelecionada = document.querySelector(
            'input[name="recebimento"]:checked'
        );

        if (!opcaoSelecionada) {
            alert("Selecione uma forma de recebimento.");
            return;
        }

        const recebimento = opcaoSelecionada.value;

        let endereco = "";
        let bairro = "";

        if (recebimento === "entrega") {
            const campoEndereco = document.getElementById("endereco");
            const campoBairro = document.getElementById("bairro");

            if (!campoEndereco || !campoBairro) {
                alert("Não foi possível localizar os campos de endereço.");
                return;
            }

            endereco = campoEndereco.value.trim();
            bairro = campoBairro.value.trim();

            if (!endereco || !bairro) {
                alert("Informe o endereço e o bairro para a entrega.");
                return;
            }
        }

        // MONTAR PEDIDO
        let total = 0;

        let mensagem = "Olá! Gostaria de fazer um pedido.\n\n";

        produtosPedido.forEach(function (item) {
            const subtotal = item.preco * item.quantidade;

            total += subtotal;

            mensagem +=
                "- " + item.produto.nome +
                " | Quantidade: " + item.quantidade +
                " | Subtotal: " + formatarMoeda(subtotal) + "\n";
        });

        mensagem += "\nTotal: " + formatarMoeda(total);

        if (recebimento === "entrega") {
            mensagem +=
                "\n\nForma de recebimento: Entrega" +
                "\nEndereço: " + endereco +
                "\nBairro: " + bairro;
        } else {
            mensagem += "\n\nForma de recebimento: Retirada na loja";
        }

        // ENVIAR PELO WHATSAPP
        const numeroWhatsApp = "5548996677453";

        const link =
            "https://wa.me/" + numeroWhatsApp +
            "?text=" + encodeURIComponent(mensagem);

        window.open(link, "_blank", "noopener,noreferrer");
    });
}


// ========================================
// INICIALIZAÇÃO
// ========================================

atualizarEnderecoEntrega();
mostrarCarrinho();
