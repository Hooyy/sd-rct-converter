class App {
    constructor() {
        // Initialize theme management
        this.themeManager = new ThemeManager();
        // Store selected items
        this.selectedItems = [];
        this.selectedRequiredDefeats = [];
        this.selectedBiomeTagBlacklist = [];
        this.selectedBiomeTagWhitelist = [];
        // Initialize form handlers
        this.initializeFormHandlers();

    }

    initializeFormHandlers() {
        // Theme toggle handler
        document.getElementById('theme-toggle')?.addEventListener('change', (e) => {
            this.themeManager.toggleTheme(e.target.checked);
        });

        // Config selector handler
        document.getElementById('config-selector')?.addEventListener('change', (e) => {
            this.toggleConfigSections(e.target.value);
        });

        // Convert button handler
        document.getElementById('convert-button')?.addEventListener('click', () => {
            this.handleConversion();
        });

        // Convert mob button handler
        document.getElementById('convert-mob-button')?.addEventListener('click', () => {
            this.handleMobConversion();
        });

        // Max Select Margin warning handler
        document.getElementById('max-select-margin')?.addEventListener('input', (e) => {
            this.updateMaxSelectMarginWarning(e.target.value);
        });

        // Item type selection handler
        document.getElementById('item-type')?.addEventListener('change', (e) => {
            this.toggleCustomItemInput(e.target.value);
        });

        // Handle item selection
        document.getElementById('add-item-button')?.addEventListener('click', () => {
            this.addItem();
        });

        // Add custom item button handler
        document.getElementById('add-custom-item')?.addEventListener('click', () => {
            this.addCustomItem();
        });

        // Add download JSON button handler
        document.getElementById('download-json-button')?.addEventListener('click', () => {
            this.downloadJSON();
        });

        // Garantir que a seção correta seja exibida ao carregar a página
        const initialSelection = document.getElementById('config-selector').value;
        this.toggleConfigSections(initialSelection);

        // Required Defeats
        document.getElementById('add-required-defeat')?.addEventListener('click', () => {
            this.addItemToList('required-defeats-select', 'required-defeats-custom', 'required-defeats-list', this.selectedRequiredDefeats);
        });

        // Required Defeats
        document.getElementById('required-defeats-select')?.addEventListener('change', (e) => {
            this.toggleCustomInput(e.target.value, 'required-defeats-custom-container');
        });


        // Biome Tag Blacklist
        document.getElementById('biome-tag-blacklist-select')?.addEventListener('change', (e) => {
            this.toggleCustomInput(e.target.value, 'biome-tag-blacklist-custom-container');
        });
        document.getElementById('add-biome-tag-blacklist')?.addEventListener('click', () => {
            this.addItemToList('biome-tag-blacklist-select', 'biome-tag-blacklist-custom', 'biome-tag-blacklist-list', this.selectedBiomeTagBlacklist);
        });

        // Biome Tag Whitelist
        document.getElementById('biome-tag-whitelist-select')?.addEventListener('change', (e) => {
            this.toggleCustomInput(e.target.value, 'biome-tag-whitelist-custom-container');
        });
        document.getElementById('add-biome-tag-whitelist')?.addEventListener('click', () => {
            this.addItemToList('biome-tag-whitelist-select', 'biome-tag-whitelist-custom', 'biome-tag-whitelist-list', this.selectedBiomeTagWhitelist);
        });
    }

    toggleCustomInput(value, containerId) {
        const customInputContainer = document.getElementById(containerId);
        if (customInputContainer) {
            customInputContainer.style.display = value === 'other' ? 'block' : 'none';
        }
    }

    // Função para alternar entre as seções de configuração
    toggleConfigSections(selectedValue) {
        const aiSettings = document.getElementById('ai-settings');
        const mainSettings = document.getElementById('main-settings');
        const mobSettings = document.getElementById('mob-settings'); // Nova seção

        if (selectedValue === 'ai') {
            aiSettings.style.display = 'block';
            mainSettings.style.display = 'none';
            mobSettings.style.display = 'none';
        } else if (selectedValue === 'main') {
            aiSettings.style.display = 'none';
            mainSettings.style.display = 'block';
            mobSettings.style.display = 'none';
        } else if (selectedValue === 'mob') {
            aiSettings.style.display = 'none';
            mainSettings.style.display = 'none';
            mobSettings.style.display = 'block';
        }
    }

    addItemToList(selectId, customInputId, listId, selectedItems) {
        const select = document.getElementById(selectId);
        const customInput = document.getElementById(customInputId);
        const list = document.getElementById(listId);

        if (select && list) {
            const selectedValue = select.value === 'other' ? customInput.value.trim() : select.value;

            // Debug: Exibir o valor selecionado
            console.log('Selected Value:', selectedValue);

            // Verifica se o valor já existe na lista
            if (selectedValue && !selectedItems.includes(selectedValue)) {
                selectedItems.push(selectedValue);
                this.updateList(list, selectedItems);

                // Limpa o input personalizado após adicionar
                if (select.value === 'other') {
                    customInput.value = '';
                }
            } else {
                console.warn('Item já existe na lista ou valor inválido.');
            }
        }
    }

    updateList(list, items) {
        if (list) {
            list.innerHTML = ''; // Limpar lista
            items.forEach(item => {
                const listItem = document.createElement('li');
                // Se o item for um array, exiba com colchetes e aspas, sem espaços após as vírgulas
                if (Array.isArray(item)) {
                    listItem.textContent = `[${item.map(i => `"${i}"`).join(', ')}]`;
                } else {
                    listItem.textContent = item; // Exibir como string
                }
                list.appendChild(listItem);
            });
        }
    }


    // Função para adicionar o item
    addItem() {
        const itemTypeSelect = document.getElementById('item-type');
        const itemType = itemTypeSelect ? itemTypeSelect.value : null;
        let customItem = null;

        // Se 'Other' for selecionado, pega o valor do item customizado
        if (itemType === 'other') {
            const customItemInput = document.getElementById('custom-item');
            customItem = customItemInput ? customItemInput.value.trim() : '';
            if (!customItem) {
                alert('Please enter a custom item.');
                return;
            }
        }

        // Adiciona o item na lista
        const item = customItem ? { item: customItem, quantity: 1 } : { item: itemType, quantity: 1 };
        this.addOrUpdateItem(item);
    }

    // Adiciona ou atualiza um item
    addOrUpdateItem(item) {
        const existingItem = this.selectedItems.find(i => i.item === item.item);

        if (existingItem) {
            existingItem.quantity++;  // Aumenta a quantidade do item
        } else {
            this.selectedItems.push(item);  // Adiciona um novo item
        }

        this.updateSelectedItemList();  // Atualiza a lista de itens
    }

    addItemToList(selectId, customInputId, listId, selectedItems) {
        const select = document.getElementById(selectId);
        const customInput = document.getElementById(customInputId);
        const list = document.getElementById(listId);

        if (select && list) {
            let selectedValue;

            if (select.value === 'other') {
                // Processar input customizado
                selectedValue = customInput.value.trim();
                if (selectedValue) {
                    // Sempre adicionar como array
                    const items = selectedValue.split(',').map(item => item.trim()).filter(item => item);
                    if (items.length > 0) {
                        selectedItems.push(items); // Adicionar como array
                    }
                    // Limpar input
                    customInput.value = '';
                }
            } else {
                // Adicionar valor do select como array
                selectedValue = select.value;
                if (selectedValue) {
                    selectedItems.push([selectedValue]); // Adicionar como array com um único elemento
                }
            }

            // Atualizar lista na interface
            this.updateList(list, selectedItems);
        }
    }

    // Exibe ou oculta o input para item customizado
    toggleCustomItemInput(value) {
        const customItemContainer = document.getElementById('custom-item-container');
        if (customItemContainer) {
            customItemContainer.style.display = value === 'other' ? 'block' : 'none';
        }
    }

    // Atualiza a lista de itens selecionados na UI
    updateSelectedItemList() {
        const listContainer = document.getElementById('selected-items-list');
        if (listContainer) {
            listContainer.innerHTML = ''; // Limpa a lista

            // Renderiza cada item na lista
            this.selectedItems.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.item} (x${item.quantity})`;

                // Adiciona botões para cada item (Adicionar, Subtrair, Remover)
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'item-buttons';

                const addButton = document.createElement('button');
                addButton.textContent = '+';
                addButton.className = 'item-button add';
                addButton.addEventListener('click', () => this.addItemQuantity(item.item));

                const subtractButton = document.createElement('button');
                subtractButton.textContent = '-';
                subtractButton.className = 'item-button subtract';
                subtractButton.addEventListener('click', () => this.subtractItemQuantity(item.item));

                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.className = 'item-button remove';
                removeButton.addEventListener('click', () => this.removeItem(item.item));

                buttonContainer.appendChild(addButton);
                buttonContainer.appendChild(subtractButton);
                buttonContainer.appendChild(removeButton);

                listItem.appendChild(buttonContainer);
                listContainer.appendChild(listItem);
            });
        }
    }

    // Funções para aumentar, diminuir a quantidade de um item ou removê-lo
    addItemQuantity(itemName) {
        const item = this.selectedItems.find(i => i.item === itemName);
        if (item) {
            item.quantity++;
            this.updateSelectedItemList();
        }
    }

    subtractItemQuantity(itemName) {
        const item = this.selectedItems.find(i => i.item === itemName);
        if (item && item.quantity > 1) {
            item.quantity--;
            this.updateSelectedItemList();
        } else {
            this.removeItem(itemName);
        }
    }

    removeItem(itemName) {
        this.selectedItems = this.selectedItems.filter(i => i.item !== itemName);
        this.updateSelectedItemList();
    }

    // Função para gerenciar a conversão de texto
    handleConversion() {
        try {
            const input = document.getElementById('input')?.value;
            const trainerConfig = this.getTrainerConfig();

            if (!input) {
                throw new Error('Input text is empty.');
            }

            const result = ShowdownConverter.convert(input, trainerConfig);

            if (result.success) {
                document.getElementById('output').textContent = result.result;
            } else {
                document.getElementById('output').textContent = 'Error: ' + result.error;
            }
        } catch (error) {
            document.getElementById('output').textContent = 'Error: ' + error.message;
        }
    }


    // Função para baixar o JSON em uma estrutura de pastas ZIP
    downloadJSON() {
        try {
            const input = document.getElementById('input')?.value;
            const trainerConfig = this.getTrainerConfig();
            const mobConfig = this.getMobConfig();

            // Verificar se o nome do treinador foi preenchido
            if (!trainerConfig.name) {
                throw new Error('Trainer name is required.');
            }

            if (!input) {
                throw new Error('Input text is empty.');
            }

            const result = ShowdownConverter.convert(input, trainerConfig);

            if (result.success) {
                const trainerName = trainerConfig.name.trim().replace(/[^a-zA-Z0-9_-]/g, '_');

                const zip = new JSZip();

                // Pasta data/rctmod/trainers
                const trainersFolder = zip.folder("data/rctmod/trainers");
                trainersFolder.file(`${trainerName}.json`, result.result);

                // Pasta data/rctmod/mobs/single
                const mobsFolder = zip.folder("data/rctmod/mobs");
                const singleFolder = mobsFolder.folder("single");
                singleFolder.file(`${trainerName}.json`, JSON.stringify(mobConfig, null, 2));

                // Gerar o arquivo ZIP
                zip.generateAsync({ type: "blob" })
                    .then((blob) => {
                        saveAs(blob, `RCTrainer_${trainerName}.zip`);
                    })
                    .catch((error) => {
                        console.error('Error generating ZIP:', error);
                    });
            } else {
                console.error('Error in conversion:', result.error);
            }
        } catch (error) {
            console.error('Error generating JSON:', error.message);
            alert(error.message); // Mostra uma mensagem de erro para o usuário
        }
    }

    getMobConfig() {
        return {
            type: document.getElementById('mob-type').value || undefined,
            requiredDefeats: this.selectedRequiredDefeats, // Usar a lista de Required Defeats
            maxTrainerWins: document.getElementById('max-trainer-wins').value
                ? parseInt(document.getElementById('max-trainer-wins').value)
                : undefined,
            maxTrainerDefeats: document.getElementById('max-trainer-defeats').value
                ? parseInt(document.getElementById('max-trainer-defeats').value)
                : undefined,
            battleCooldownTicks: document.getElementById('battle-cooldown-ticks').value
                ? parseInt(document.getElementById('battle-cooldown-ticks').value)
                : undefined,
            spawnWeightFactor: document.getElementById('spawn-weight-factor').value
                ? parseFloat(document.getElementById('spawn-weight-factor').value)
                : undefined,
            biomeTagBlacklist: this.selectedBiomeTagBlacklist, // Usar a lista de biomeTagBlacklist
            biomeTagWhitelist: this.selectedBiomeTagWhitelist // Usar a lista de biomeTagWhitelist
        };
    }

    // Função para gerenciar a conversão das informações do mob
    handleMobConversion() {
        try {
            const mobConfig = this.getMobConfig();

            // Formatar requiredDefeats manualmente
            const formattedRequiredDefeats = mobConfig.requiredDefeats
                .map(item => Array.isArray(item) ? `[${item.map(i => `"${i}"`).join(', ')}]` : `"${item}"`)
                .join(',\n    ');

            // Construir o JSON manualmente para requiredDefeats
            const mobJson = `{
      "type": ${JSON.stringify(mobConfig.type)},
      "requiredDefeats": [
        ${formattedRequiredDefeats}
      ],
      "maxTrainerWins": ${JSON.stringify(mobConfig.maxTrainerWins)},
      "maxTrainerDefeats": ${JSON.stringify(mobConfig.maxTrainerDefeats)},
      "battleCooldownTicks": ${JSON.stringify(mobConfig.battleCooldownTicks)},
      "spawnWeightFactor": ${JSON.stringify(mobConfig.spawnWeightFactor)},
      "biomeTagBlacklist": ${JSON.stringify(mobConfig.biomeTagBlacklist)},
      "biomeTagWhitelist": ${JSON.stringify(mobConfig.biomeTagWhitelist)}
    }`;

            // Exibir o resultado na área de saída
            document.getElementById('output').textContent = mobJson;
        } catch (error) {
            document.getElementById('output').textContent = 'Error: ' + error.message;
        }
    }


    // Função para obter a configuração do treinador
    getTrainerConfig() {
        // Capture the selected items and their quantities
        const selectedItems = this.selectedItems.map(item => ({
            item: item.item,
            quantity: item.quantity
        }));

        // Get references to the form inputs
        const trainerNameInput = document.getElementById('trainer-name');
        const maxSelectMarginInput = document.getElementById('max-select-margin');
        const moveBiasInput = document.getElementById('move-bias');
        const statMoveBiasInput = document.getElementById('stat-move-bias');
        const switchBiasInput = document.getElementById('switch-bias');
        const itemBiasInput = document.getElementById('item-bias');
        const battleFormatInput = document.getElementById('battle-format');
        const maxItemsInput = document.getElementById('max-items');
        const itemQuantityInput = document.getElementById('item-quantity');
        const trainerIdentityInput = document.getElementById('trainer-identity');

        // Return the trainer configuration object
        return {
            name: trainerNameInput ? trainerNameInput.value : '',
            identity: trainerIdentityInput ? trainerIdentityInput.value : '',
            maxSelectMargin: maxSelectMarginInput ? parseFloat(maxSelectMarginInput.value) : '',
            moveBias: moveBiasInput ? parseFloat(moveBiasInput.value) : '',
            statMoveBias: statMoveBiasInput ? parseFloat(statMoveBiasInput.value) : '',
            switchBias: switchBiasInput ? parseFloat(switchBiasInput.value) : '',
            itemBias: itemBiasInput ? parseFloat(itemBiasInput.value) : '',
            battleFormat: battleFormatInput ? battleFormatInput.value : '',
            maxItems: maxItemsInput ? parseInt(maxItemsInput.value) : '',
            itemType: selectedItems,
            itemQuantity: itemQuantityInput ? parseInt(itemQuantityInput.value) : 0
        };
    }



    // Função para atualizar o aviso sobre o comportamento da IA
    updateAIWarning(value) {
        const warning = document.getElementById('ai-warning');
        if (warning) {
            if (value < 0.1) {
                warning.textContent = "Very challenging AI behavior";
            } else if (value > 0.3) {
                warning.textContent = "More random AI behavior";
            } else {
                warning.textContent = "";
            }
        }
    }

    // Função para adicionar um item customizado
    addCustomItem() {
        const customItemInput = document.getElementById('custom-item');
        if (customItemInput) {
            const customItemValue = customItemInput.value.trim();
            if (customItemValue) {
                this.addOrUpdateItem({ item: customItemValue, quantity: 1 });
                customItemInput.value = ''; // Limpa o input após adicionar
            }
        }
    }
}

// Theme management class
class ThemeManager {
    constructor() {
        this.initialize();
    }

    initialize() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = savedTheme === 'dark';
        }
    }

    toggleTheme(isDark) {
        const newTheme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
