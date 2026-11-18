
// ========================================
// PRODUTOS INICIAIS
// ========================================

function produtosIniciais() {
    return [
        {
            id: 1,
            nome: "Ração para cães",
            descricao: "Alimento completo para cães adultos.",
            preco: 50.00,
            categoria: "Rações",
            estoque: 10,
            imagem: "https://loremflickr.com/640/480/dog-food?lock=101"
        },
        {
            id: 2,
            nome: "Ração para gatos",
            descricao: "Alimento nutritivo para gatos.",
            preco: 45.00,
            categoria: "Rações",
            estoque: 8,
            imagem: "https://loremflickr.com/640/480/cat-food?lock=102"
        },
        {
            id: 3,
            nome: "Ração para aves",
            descricao: "Mistura de grãos para alimentação de aves.",
            preco: 30.00,
            categoria: "Rações",
            estoque: 5,
            imagem: "https://loremflickr.com/640/480/bird-seed?lock=103"
        },
        {
            id: 4,
            nome: "Coleira para cães",
            descricao: "Coleira resistente e confortável.",
            preco: 25.00,
            categoria: "Acessórios",
            estoque: 15,
            imagem: "https://loremflickr.com/640/480/dog-collar?lock=104"
        },
        {
            id: 5,
            nome: "Brinquedo para gatos",
            descricao: "Brinquedo para diversão dos felinos.",
            preco: 18.00,
            categoria: "Acessórios",
            estoque: 12,
            imagem: "https://loremflickr.com/640/480/cat-toy?lock=105"
        },
        {
            id: 6,
            nome: "Shampoo para cães",
            descricao: "Produto para higiene e cuidados dos animais.",
            preco: 22.00,
            categoria: "Higiene e cuidados",
            estoque: 10,
            imagem: "https://loremflickr.com/640/480/dog-shampoo?lock=106"
        },
        {
            id: 7,
            nome: "Escova para animais",
            descricao: "Escova para cuidar dos pelos dos animais.",
            preco: 20.00,
            categoria: "Higiene e cuidados",
            estoque: 9,
            imagem: "https://loremflickr.com/640/480/pet-brush?lock=107"
        },
        {
            id: 8,
            nome: "Vaso para plantas",
            descricao: "Vaso para cultivo de plantas e flores.",
            preco: 35.00,
            categoria: "Jardinagem",
            estoque: 7,
            imagem: "https://loremflickr.com/640/480/flower-pot?lock=108"
        },
        {
            id: 9,
            nome: "Pá de jardinagem",
            descricao: "Ferramenta para trabalhos no jardim.",
            preco: 28.00,
            categoria: "Jardinagem",
            estoque: 6,
            imagem: "https://loremflickr.com/640/480/garden-shovel?lock=109"
        },
        {
            id: 10,
            nome: "Mangueira de jardim",
            descricao: "Mangueira para irrigação e limpeza.",
            preco: 65.00,
            categoria: "Jardinagem",
            estoque: 5,
            imagem: "https://loremflickr.com/640/480/garden-hose?lock=110"
        },
        {
            id: 11,
            nome: "Antisséptico veterinário",
            descricao: "Produto para cuidados veterinários.",
            preco: 32.00,
            categoria: "Medicamentos",
            estoque: 8,
            imagem: "https://loremflickr.com/640/480/veterinary-medicine?lock=111"
        },
        {
            id: 12,
            nome: "Comedouro para animais",
            descricao: "Recipiente para alimentação de animais.",
            preco: 24.00,
            categoria: "Acessórios",
            estoque: 11,
            imagem: "https://loremflickr.com/640/480/pet-bowl?lock=112"
        }
    ];
}


// ========================================
// CARREGAR E ATUALIZAR PRODUTOS
// ========================================

function carregarProdutos() {
    try {
        const dadosSalvos = localStorage.getItem("produtos");

        let dados = dadosSalvos === null
            ? []
            : JSON.parse(dadosSalvos);

        if (!Array.isArray(dados) || dados.some(function (produto) {
            return produto === null ||
                typeof produto !== "object" ||
                Array.isArray(produto);
        })) {
            throw new Error("A lista de produtos possui um formato inválido.");
        }

        // Atualiza produtos antigos apenas uma vez.
        // Não apaga os produtos cadastrados pelo administrador.
        const migracaoConcluida =
            localStorage.getItem("produtosV3Migracao") === "concluida";

        if (!migracaoConcluida) {
            const iniciais = produtosIniciais();

            iniciais.forEach(function (produtoInicial) {
                const produtoExistente = dados.find(function (produto) {
                    return String(produto.id) === String(produtoInicial.id);
                });

                if (produtoExistente) {
                    // Mantém os dados existentes e adiciona imagem
                    // quando o produto ainda não possui uma.
                    if (!produtoExistente.imagem) {
                        produtoExistente.imagem = produtoInicial.imagem;
                    }
                } else {
                    dados.push(produtoInicial);
                }
            });

            localStorage.setItem("produtosV3Migracao", "concluida");
        }

        const produtosCarregados = dados.map(function (produto) {
            return {
                ...produto,

                estoque: Number.isInteger(Number(produto.estoque)) &&
                    Number(produto.estoque) >= 0
                    ? Number(produto.estoque)
                    : 0,

                imagem: typeof produto.imagem === "string"
                    ? produto.imagem
                    : ""
            };
        });

        localStorage.setItem(
            "produtos",
            JSON.stringify(produtosCarregados)
        );

        return {
            produtos: produtosCarregados,
            erro: false
        };

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);

        return {
            produtos: [],
            erro: true
        };
    }
}


const resultadoProdutos = carregarProdutos();
let produtos = resultadoProdutos.produtos;


// ========================================
// ELEMENTO DA LISTA
// ========================================

const listaProdutos = document.getElementById("lista-produtos");


// ========================================
// MOSTRAR PRODUTOS
// ========================================

function mostrarProdutos() {
    if (!listaProdutos) {
        return;
    }

    listaProdutos.replaceChildren();

    if (resultadoProdutos.erro) {
        listaProdutos.textContent =
            "Não foi possível carregar os produtos. Verifique os dados salvos.";
        return;
    }

    if (produtos.length === 0) {
        listaProdutos.textContent = "Nenhum produto disponível.";
        return;
    }

    produtos.forEach(function (produto) {

        const artigo = document.createElement("article");
        artigo.classList.add("produto");

        // IMAGEM
        const imagem = document.createElement("div");
        imagem.classList.add("produto-imagem");

        const icone = document.createElement("span");

        const iconesCategorias = {
            "Rações": "🌾",
            "Acessórios": "🐾",
            "Medicamentos": "🩺",
            "Higiene e cuidados": "🧼",
            "Jardinagem": "🌱"
        };

        icone.textContent =
            iconesCategorias[produto.categoria] || "🛒";

        icone.setAttribute("aria-hidden", "true");

        if (produto.imagem && produto.imagem.trim() !== "") {
            const fotografia = document.createElement("img");

            fotografia.src = produto.imagem;
            fotografia.alt = produto.nome || "Fotografia do produto";
            fotografia.loading = "lazy";

            fotografia.onerror = function () {
                imagem.replaceChildren(icone);
            };

            imagem.appendChild(fotografia);

        } else {
            imagem.appendChild(icone);
        }

        // INFORMAÇÕES
        const informacoes = document.createElement("div");
        informacoes.classList.add("produto-info");

        const categoria = document.createElement("span");
        categoria.classList.add("categoria-produto");
        categoria.textContent = produto.categoria || "Sem categoria";

        const nome = document.createElement("h3");
        nome.textContent = produto.nome || "Produto sem nome";

        const descricao = document.createElement("p");
        descricao.textContent =
            produto.descricao || "Descrição não informada.";

        const preco = document.createElement("p");
        preco.classList.add("preco");

        const valor = Number(produto.preco);

        preco.textContent = Number.isFinite(valor) && valor >= 0
            ? valor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })
            : "Preço não informado";

        const estoque = document.createElement("p");

        estoque.textContent = produto.estoque > 0
            ? "Em estoque: " + produto.estoque + " unidade(s)"
            : "Produto indisponível";

        // BOTÃO DO CARRINHO
        const botao = document.createElement("button");

        botao.classList.add("botao-produto");
        botao.type = "button";

        if (produto.estoque > 0) {
            botao.textContent = "Adicionar ao carrinho";

            botao.addEventListener("click", function () {
                adicionarCarrinho(produto.id);
            });

        } else {
            botao.textContent = "Sem estoque";
            botao.disabled = true;
        }

        informacoes.append(
            categoria,
            nome,
            descricao,
            preco,
            estoque,
            botao
        );

        artigo.append(imagem, informacoes);

        listaProdutos.appendChild(artigo);
    });
}


// ========================================
// ADICIONAR AO CARRINHO
// ========================================

function adicionarCarrinho(id) {
    let produtosAtuais;
    let carrinho;

    try {
        produtosAtuais = JSON.parse(
            localStorage.getItem("produtos") || "[]"
        );

        carrinho = JSON.parse(
            localStorage.getItem("carrinho") || "[]"
        );

    } catch (erro) {
        console.error("Erro ao consultar os dados:", erro);

        alert("Não foi possível consultar os produtos ou o carrinho.");
        return;
    }

    if (!Array.isArray(produtosAtuais) ||
        !Array.isArray(carrinho)) {

        alert("Os dados dos produtos ou do carrinho estão inválidos.");
        return;
    }

    const produtoSelecionado = produtosAtuais.find(function (produto) {
        return produto && String(produto.id) === String(id);
    });

    if (!produtoSelecionado) {
        alert("Produto não encontrado.");
        return;
    }

    const estoqueDisponivel = Number(produtoSelecionado.estoque);

    if (!Number.isInteger(estoqueDisponivel) ||
        estoqueDisponivel <= 0) {

        alert("Este produto está sem estoque.");

        produtos = produtosAtuais;
        mostrarProdutos();

        return;
    }

    // Soma as quantidades que já estão no carrinho.
    const quantidadeNoCarrinho = carrinho.reduce(
        function (total, item) {

            if (String(item.id) !== String(id)) {
                return total;
            }

            const quantidade = Number(item.quantidade);

            return total + (
                Number.isInteger(quantidade) && quantidade > 0
                    ? quantidade
                    : 1
            );
        },
        0
    );

    if (quantidadeNoCarrinho + 1 > estoqueDisponivel) {
        alert("Estoque insuficiente para adicionar outra unidade.");
        return;
    }

    const preco = Number(produtoSelecionado.preco);

    if (!Number.isFinite(preco) || preco <= 0) {
        alert("Este produto possui um preço inválido.");
        return;
    }

    // Adiciona uma unidade ao carrinho.
    carrinho.push({
        id: produtoSelecionado.id,
        nome: produtoSelecionado.nome,
        descricao: produtoSelecionado.descricao,
        preco: preco,
        categoria: produtoSelecionado.categoria,
        quantidade: 1,
        imagem: typeof produtoSelecionado.imagem === "string"
            ? produtoSelecionado.imagem
            : ""
    });

    try {
        localStorage.setItem(
            "carrinho",
            JSON.stringify(carrinho)
        );

        alert(
            produtoSelecionado.nome +
            " foi adicionado ao carrinho!"
        );

    } catch (erro) {
        console.error("Erro ao salvar o carrinho:", erro);

        alert("Não foi possível salvar o produto no carrinho.");
    }
}


// ========================================
// INICIALIZAÇÃO
// ========================================

mostrarProdutos();
