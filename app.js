class App {
    constructor() {
        this.themeManager = new ThemeManager();
        this.selectedItems = [];
        this.selectedRequiredDefeats = [];
        this.selectedBiomeTagBlacklist = [];
        this.selectedBiomeTagWhitelist = [];
        this.selectedImage = null; // Armazena a textura selecionada
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
            this.updateMaxSelectMarginWarning(parseFloat(e.target.value));
        });

        // Item type selection handler
        document.getElementById('item-type')?.addEventListener('change', (e) => {
            this.toggleCustomItemInput(e.target.value);
        });

        // Handle item selection
        document.getElementById('add-item-button')?.addEventListener('click', () => {
            this.addItem();
        });

        // Add download JSON button handler
        document.getElementById('download-json-button')?.addEventListener('click', () => {
            this.downloadJSON();
        });

        // Garantir que a seção correta seja exibida ao carregar a página
        const initialSelection = document.getElementById('config-selector').value;
        this.toggleConfigSections(initialSelection);

        const maxSelectMarginInput = document.getElementById('max-select-margin');
        if (maxSelectMarginInput) {
            this.updateMaxSelectMarginWarning(parseFloat(maxSelectMarginInput.value));
        }

        // Nome da série
        document.getElementById('series-select')?.addEventListener('change', (e) => {
                this.toggleCustomInput(e.target.value, 'series-custom-container');
            });

        // Required Defeats
        document.getElementById('add-required-defeat')?.addEventListener('click', () => {
            this.addItemToList(
                'required-defeats-select',
                'required-defeats-custom',
                'required-defeats-list',
                this.selectedRequiredDefeats,
                { allowGroups: true }
            );
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

        // Handler para o upload da imagem
        document.getElementById('trainer-image')?.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });

        // Handler para remover imagem
        document.getElementById('remove-image')?.addEventListener('click', () => {
            this.removeImage();
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
        const mobSettings = document.getElementById('mob-settings');
        const seriesSettings = document.getElementById('series-settings'); // Nova seção

        if (selectedValue === 'ai') {
            aiSettings.style.display = 'block';
            mainSettings.style.display = 'none';
            mobSettings.style.display = 'none';
            seriesSettings.style.display = 'none';
        } else if (selectedValue === 'main') {
            aiSettings.style.display = 'none';
            mainSettings.style.display = 'block';
            mobSettings.style.display = 'none';
            seriesSettings.style.display = 'none';
        } else if (selectedValue === 'mob') {
            aiSettings.style.display = 'none';
            mainSettings.style.display = 'none';
            mobSettings.style.display = 'block';
            seriesSettings.style.display = 'none';
        } else if (selectedValue === 'series') {
            aiSettings.style.display = 'none';
            mainSettings.style.display = 'none';
            mobSettings.style.display = 'none';
            seriesSettings.style.display = 'block';
        }
    }

    addItemToList(selectId, customInputId, listId, selectedItems, options = {}) {
        const { allowGroups = false } = options;
        const select = document.getElementById(selectId);
        const customInput = document.getElementById(customInputId);
        const list = document.getElementById(listId);

        if (!select || !list) {
            return;
        }

        const rawValue = select.value === 'other' ? (customInput?.value ?? '') : select.value;
        const parsedValues = rawValue
            .split(',')
            .map(value => value.trim())
            .filter(value => value);

        if (parsedValues.length === 0) {
            console.warn('Tentativa de adicionar valor nulo ou vazio ignorada.');
            return;
        }

        if (allowGroups) {
            const exists = selectedItems.some(item => Array.isArray(item)
                && item.length === parsedValues.length
                && item.every((v, idx) => v === parsedValues[idx]));

            if (exists) {
                console.warn('Item já existe na lista ou valor inválido.');
                return;
            }

            selectedItems.push(parsedValues);
        } else {
            let added = false;
            parsedValues.forEach(value => {
                if (!selectedItems.includes(value)) {
                    selectedItems.push(value);
                    added = true;
                }
            });

            if (!added) {
                console.warn('Item já existe na lista ou valor inválido.');
                return;
            }
        }

        this.updateList(list, selectedItems);

        if (select.value === 'other' && customInput) {
            customInput.value = '';
        }
    }

    updateList(list, items) {
        if (list) {
            list.innerHTML = ''; // Clear the list
            items.forEach(item => {
                const listItem = document.createElement('li');
                if (Array.isArray(item)) {
                    listItem.textContent = `[${item.map(i => `"${i}"`).join(', ')}]`;
                } else {
                    listItem.textContent = item; // Display as a string
                }
                list.appendChild(listItem);
            });
        }
    }

    handleImageUpload(file) {
        if (file) {
            this.selectedImage = file;
            const imageNameSpan = document.getElementById('selected-image-name');
            const removeButton = document.getElementById('remove-image');
            if (imageNameSpan && removeButton) {
                imageNameSpan.textContent = file.name;
                removeButton.style.display = 'inline-block';
            }
        }
    }

    removeImage() {
        this.selectedImage = null;
        const imageNameSpan = document.getElementById('selected-image-name');
        const removeButton = document.getElementById('remove-image');
        const imageInput = document.getElementById('trainer-image');
        if (imageNameSpan && removeButton && imageInput) {
            imageNameSpan.textContent = 'Nenhuma textura selecionada';
            removeButton.style.display = 'none';
            imageInput.value = ''; // Limpa o input de arquivo
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

    parseNumberInput(inputId, parser) {
        const input = document.getElementById(inputId);
        if (!input) {
            return undefined;
        }

        const rawValue = input.value;
        if (rawValue === '' || rawValue === null) {
            return undefined;
        }

        const normalizedValue = rawValue.trim();
        if (!normalizedValue) {
            return undefined;
        }

        const parsedValue = parser === parseFloat ? parser(normalizedValue) : parser(normalizedValue, 10);
        return Number.isNaN(parsedValue) ? undefined : parsedValue;
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
            const mobData = this.formatMobData(mobConfig);

            if (!trainerConfig.name) {
                throw new Error('Trainer name is required.');
            }

            if (!input) {
                throw new Error('Input text is empty.');
            }

            const result = ShowdownConverter.convert(input, trainerConfig);

            if (result.success) {
                // Obter o nome do treinador e convertê-lo para minúsculas
                let trainerName = trainerConfig.name.trim().replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

                // Obter o tipo de treinador (Mob Type) e convertê-lo para minúsculas
                const mobType = mobData.type ? mobData.type.toLowerCase() : 'normal';

                // Adicionar o prefixo do tipo se não for "normal"
                const fileNamePrefix = mobType !== 'normal' ? `${mobType}_` : '';
                const fileName = `${fileNamePrefix}${trainerName}`;

                const zip = new JSZip();

                // Arquivo na pasta trainers
                const trainersFolder = zip.folder("data/rctmod/trainers");
                trainersFolder.file(`${fileName}.json`, result.result);

                // Arquivo na pasta mobs/single
                const mobsFolder = zip.folder("data/rctmod/mobs");
                const singleFolder = mobsFolder.folder("single");
                singleFolder.file(`${fileName}.json`, JSON.stringify(mobData, null, 2));

                // Gerar o ZIP com nome em minúsculas
                zip.generateAsync({ type: "blob" })
                    .then((blob) => {
                        saveAs(blob, `${fileName}.zip`);
                    })
                    .catch((error) => {
                        console.error('Error generating ZIP:', error);
                    });
            } else {
                console.error('Error in conversion:', result.error);
            }
        } catch (error) {
            console.error('Error generating JSON:', error.message);
            alert(error.message);
        }
    }

    getMobConfig() {
        const seriesSelect = document.getElementById('series-select');
        const seriesCustom = document.getElementById('series-custom');
        const signatureItemInput = document.getElementById('signature-item');
        const gimmickTagInput = document.getElementById('gimmick-tag');

        // Determinar o valor do Series
        const seriesValue = seriesSelect && seriesSelect.value === 'other'
            ? (seriesCustom ? seriesCustom.value.trim() : '')
            : (seriesSelect ? seriesSelect.value : '');

        const series = seriesValue
            .split(',')
            .map(entry => entry.trim())
            .filter(entry => entry);

        const signatureItem = signatureItemInput ? signatureItemInput.value.trim() : '';
        const gimmickTag = gimmickTagInput ? gimmickTagInput.value.trim() : '';

        return {
            type: document.getElementById('mob-type').value || undefined,
            requiredDefeats: this.selectedRequiredDefeats,
            signatureItem: signatureItem || undefined,
            gimmickTag: gimmickTag || undefined,
            maxTrainerWins: this.parseNumberInput('max-trainer-wins', parseInt),
            maxTrainerDefeats: this.parseNumberInput('max-trainer-defeats', parseInt),
            battleCooldownTicks: this.parseNumberInput('battle-cooldown-ticks', parseInt),
            spawnWeightFactor: this.parseNumberInput('spawn-weight-factor', parseFloat),
            biomeTagBlacklist: this.selectedBiomeTagBlacklist,
            biomeTagWhitelist: this.selectedBiomeTagWhitelist,
            optional: document.getElementById('optional').value === 'true',
            series
        };
    }

    // Função para gerenciar a conversão das informações do mob
    handleMobConversion() {
        try {
            const mobData = this.formatMobData(this.getMobConfig());
            const mobJson = JSON.stringify(mobData, null, 2);
            document.getElementById('output').textContent = mobJson;
        } catch (error) {
            document.getElementById('output').textContent = 'Error: ' + error.message;
        }
    }

    formatMobData(mobConfig) {
        const mobData = {
            requiredDefeats: mobConfig.requiredDefeats.map(group => Array.isArray(group) ? [...group] : [group]),
            biomeTagBlacklist: [...mobConfig.biomeTagBlacklist],
            biomeTagWhitelist: [...mobConfig.biomeTagWhitelist],
            optional: mobConfig.optional
        };

        if (mobConfig.type) {
            mobData.type = mobConfig.type;
        }
        if (mobConfig.series) {
            if (Array.isArray(mobConfig.series) && mobConfig.series.length > 0) {
                mobData.series = [...mobConfig.series];
            }
        }
        if (mobConfig.signatureItem) {
            mobData.signatureItem = mobConfig.signatureItem;
        }
        if (mobConfig.gimmickTag) {
            mobData.gimmickTag = mobConfig.gimmickTag;
        }
        if (mobConfig.maxTrainerWins !== undefined) {
            mobData.maxTrainerWins = mobConfig.maxTrainerWins;
        }
        if (mobConfig.maxTrainerDefeats !== undefined) {
            mobData.maxTrainerDefeats = mobConfig.maxTrainerDefeats;
        }
        if (mobConfig.battleCooldownTicks !== undefined) {
            mobData.battleCooldownTicks = mobConfig.battleCooldownTicks;
        }
        if (mobConfig.spawnWeightFactor !== undefined) {
            mobData.spawnWeightFactor = mobConfig.spawnWeightFactor;
        }

        return mobData;
    }


    // Função para obter a configuração do treinador
    getTrainerConfig() {
        const trainerNameInput = document.getElementById('trainer-name');
        const maxSelectMarginInput = document.getElementById('max-select-margin');
        const moveBiasInput = document.getElementById('move-bias');
        const statMoveBiasInput = document.getElementById('stat-move-bias');
        const switchBiasInput = document.getElementById('switch-bias');
        const itemBiasInput = document.getElementById('item-bias');
        const battleFormatInput = document.getElementById('battle-format');
        const maxItemsInput = document.getElementById('max-items');
        const trainerIdentityInput = document.getElementById('trainer-identity');

        return {
            name: trainerNameInput ? trainerNameInput.value : '',
            identity: trainerIdentityInput ? trainerIdentityInput.value : '',
            maxSelectMargin: maxSelectMarginInput ? parseFloat(maxSelectMarginInput.value) : 0.15,
            moveBias: moveBiasInput ? parseFloat(moveBiasInput.value) : 1,
            statMoveBias: statMoveBiasInput ? parseFloat(statMoveBiasInput.value) : 0.1,
            switchBias: switchBiasInput ? parseFloat(switchBiasInput.value) : 0.65,
            itemBias: itemBiasInput ? parseFloat(itemBiasInput.value) : 1,
            battleFormat: battleFormatInput ? battleFormatInput.value : '',
            maxItems: maxItemsInput ? parseInt(maxItemsInput.value) : '',
            itemType: this.selectedItems.map(item => ({
                item: item.item,
                quantity: item.quantity
            }))
        };
    }



    // Função para atualizar o aviso sobre o comportamento da IA
    updateMaxSelectMarginWarning(value) {
        const warning = document.getElementById('max-select-margin-warning');
        if (!warning || Number.isNaN(value)) {
            return;
        }

        if (value < 0.1) {
            warning.textContent = 'Valores abaixo de 0.1 deixam a IA extremamente punitiva.';
        } else if (value > 0.3) {
            warning.textContent = 'Valores acima de 0.3 tornam as escolhas da IA mais aleatórias.';
        } else {
            warning.textContent = '';
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
