const ShowdownConverter = {
    // Main conversion function that ties everything together
    convert: function (showdownFormat, trainerConfig) {
        try {
            const pokemonList = this.parseShowdownFormat(showdownFormat);

            // Definir valores padrão das AI Settings
            const aiDefaults = {
                maxSelectMargin: 0.15,
                moveBias: 1,
                statMoveBias: 0.1,
                switchBias: 0.65,
                itemBias: 1
            };

            // Criar o objeto ai.data, omitindo valores padrão
            const aiData = {};
            if (trainerConfig.maxSelectMargin !== aiDefaults.maxSelectMargin) {
                aiData.maxSelectMargin = trainerConfig.maxSelectMargin;
            }
            if (trainerConfig.moveBias !== aiDefaults.moveBias) {
                aiData.moveBias = trainerConfig.moveBias;
            }
            if (trainerConfig.statMoveBias !== aiDefaults.statMoveBias) {
                aiData.statMoveBias = trainerConfig.statMoveBias;
            }
            if (trainerConfig.switchBias !== aiDefaults.switchBias) {
                aiData.switchBias = trainerConfig.switchBias;
            }
            if (trainerConfig.itemBias !== aiDefaults.itemBias) {
                aiData.itemBias = trainerConfig.itemBias;
            }

            const output = {
                name: trainerConfig.name || "Trainer",
                ...(trainerConfig.identity && { identity: trainerConfig.identity }),
                // Só inclui 'ai' se houver valores não-padrão
                ...(Object.keys(aiData).length > 0 && {
                    ai: {
                        type: "rct",
                        data: aiData
                    }
                }),
                battleRules: {
                    maxItemUses: trainerConfig.maxItems || 0
                },
                bag: this.buildBag(trainerConfig.itemType),
                team: pokemonList
            };

            if (trainerConfig.battleFormat) {
                output.battleFormat = trainerConfig.battleFormat;
            }

            return {
                success: true,
                result: JSON.stringify(output, null, 2)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    buildBag: function (itemTypes) {
        const bag = [];
        if (!Array.isArray(itemTypes)) {
            throw new Error("Input must be an array of items.");
        }

        itemTypes.forEach(itemType => {
            if (itemType && itemType.item && typeof itemType.item === "string" && typeof itemType.quantity === "number") {
                bag.push({
                    item: itemType.item,
                    quantity: itemType.quantity
                });
            } else {
                console.warn(`Invalid item format:`, itemType);
            }
        });

        return bag;
    },

    parseShowdownFormat: function (text) {
        const entries = text.split('\n\n').filter(entry => entry.trim());
        return entries.map(entry => this.parseSinglePokemon(entry));
    },

    parseSinglePokemon: function (text) {
        const lines = text.split('\n').filter(line => line.trim());
        const pokemon = {
            species: '',
            gender: '',
            level: 50,
            nature: '',
            ability: '',
            moveset: [],
            ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
            evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
        };

        let levelFound = false;

        lines.forEach(line => {
            line = line.trim();

            if (!pokemon.species) {
                const parts = line.split('@');
                const speciesData = this.processSpeciesName(parts[0].trim());
                pokemon.species = speciesData.species;
                pokemon.gender = speciesData.gender;
                if (speciesData.aspects) {
                    pokemon.aspects = speciesData.aspects;
                }
                if (parts[1]) {
                    pokemon.heldItem = parts[1].trim().toLowerCase().replace(/ /g, '_');
                }
                return;
            }

            if (line.startsWith('Ability: ')) {
                pokemon.ability = line.substring(9).trim().toLowerCase().replace(/ /g, '');
            } else if (line.startsWith('EVs: ')) {
                this.parseEVs(line.substring(5), pokemon);
            } else if (line.startsWith('IVs: ')) {
                this.parseIVs(line.substring(5), pokemon);
            } else if (line.trim().endsWith(' Nature')) {
                pokemon.nature = line.split(' ')[0].toLowerCase();
            } else if (line.startsWith('Level: ')) {
                pokemon.level = parseInt(line.substring(7).trim());
                levelFound = true;
            } else if (line.startsWith('- ')) {
                pokemon.moveset.push(line.substring(2).toLowerCase().replace(/ /g, ''));
            }
        });

        if (!levelFound) {
            pokemon.level = 50;
        }

        return pokemon;
    },

    processSpeciesName: function (name) {
        let processedName = name.toLowerCase().trim();
        const result = {};

        if (processedName.match(/(\s\(\s?[m]\s?\)|-m)$/i)) {
            processedName = processedName.replace(/(\s\(\s?[m]\s?\)|-m)$/i, '');
            result.gender = "MALE";
        } else if (processedName.match(/(\s\(\s?[f]\s?\)|-f)$/i)) {
            processedName = processedName.replace(/(\s\(\s?[f]\s?\)|-f)$/i, '');
            result.gender = "FEMALE";
        } else {
            result.gender = "GENDERLESS";
        }

        result.species = processedName;

        const regionalForms = {
            'alola': 'alolan',
            'galar': 'galarian',
            'hisui': 'hisuian',
            'paldea': 'paldean'
        };

        for (const [region, aspect] of Object.entries(regionalForms)) {
            if (processedName.includes(`-${region}`)) {
                result.species = processedName.replace(`-${region}`, '');
                result.aspects = [aspect];
                break;
            }
        }

        return result;
    },

    parseEVs: function (evString, pokemon) {
        evString.split('/').forEach(ev => {
            const [value, stat] = ev.trim().split(' ');
            const numericValue = parseInt(value);
            switch (stat.toLowerCase()) {
                case 'hp': pokemon.evs.hp = numericValue; break;
                case 'atk': pokemon.evs.atk = numericValue; break;
                case 'def': pokemon.evs.def = numericValue; break;
                case 'spa': pokemon.evs.spa = numericValue; break;
                case 'spd': pokemon.evs.spd = numericValue; break;
                case 'spe': pokemon.evs.spe = numericValue; break;
            }
        });
    },

    parseIVs: function (ivString, pokemon) {
        ivString.split('/').forEach(iv => {
            const [value, stat] = iv.trim().split(' ');
            const numericValue = parseInt(value);
            switch (stat.toLowerCase()) {
                case 'hp': pokemon.ivs.hp = numericValue; break;
                case 'atk': pokemon.ivs.atk = numericValue; break;
                case 'def': pokemon.ivs.def = numericValue; break;
                case 'spa': pokemon.ivs.spa = numericValue; break;
                case 'spd': pokemon.ivs.spd = numericValue; break;
                case 'spe': pokemon.ivs.spe = numericValue; break;
            }
        });
    }
};
