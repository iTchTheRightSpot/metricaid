export interface IPokemonApi {
    list_of_pokemons(limit: number): Promise<PokemonData[]>
}

export interface INotification {
    display(status: 'ERROR' | 'NORMAL', message: string): void
}

interface PokemonBasic {
    name: string;
    url: string;
}

export interface PokemonData {
    name: string;
    image: string;
}

export class PokemonApiImpl implements IPokemonApi {
    constructor(private readonly notify: INotification) {
    }

    readonly list_of_pokemons = async (limit: number) => {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
            const data = await response.json();

            const results: PokemonBasic[] = data.results;
            return await Promise.all(
                results.map(async (pokemon) => {
                    const res = await fetch(pokemon.url);
                    const details = await res.json();

                    return {
                        name: details.name,
                        image: details.sprites.front_default,
                    };
                })
            );
        } catch (_) {
            this.notify.display('ERROR', 'error calling pokemon api')
            return Promise.resolve([])
        }
    }
}

export class MockPokemonApiImpl implements IPokemonApi {
    list_of_pokemons(limit: number): Promise<PokemonData[]> {
        const names = [
            'bulbasaur', 'charmander', 'squirtle', 'pikachu', 'eevee',
            'jigglypuff', 'meowth', 'psyduck', 'snorlax', 'magikarp',
            'mew', 'mewtwo', 'togepi', 'slowpoke', 'dratini',
            'growlithe', 'ponyta', 'machop', 'gastly', 'abra'
        ];

        const data = names.slice(0, Math.min(limit, names.length)).map((name, index) => ({
            name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`
        }));

        return Promise.resolve(data);
    }
}

export class NotificationImpl implements INotification {
    constructor(private readonly element: HTMLElement) {
    }

    display(status: 'ERROR' | 'NORMAL', content: string): void {
        this.element.innerHTML = ''
        if (status === 'ERROR') {
            console.log(content)
        } else {
            console.log(content)
        }
    }
}