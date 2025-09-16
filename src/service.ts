export interface IPokemonApi {
    list_of_pokemons(limit: number): Promise<PokemonData[]>
}

export interface PokemonData {
    name: string;
}

export interface INotification {
    display(status: 'ERROR' | 'NORMAL', message: string, timeout?: number): void
}

export class PokemonApiImpl implements IPokemonApi {
    constructor(private readonly notify: INotification) {}

    readonly list_of_pokemons = async (limit: number) => {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
            const data = await response.json();
            return data.results.map((obj: PokemonData) => ({ name: obj.name }))
        } catch (_) {
            this.notify.display('ERROR', 'error calling pokemon api')
            return Promise.resolve([])
        }
    }
}

export class NotificationImpl implements INotification {
    constructor(private readonly element: HTMLElement) {}

    display(status: 'ERROR' | 'NORMAL', content: string, timeout: number = 3000): void {
        this.element.textContent = content
        if (status === 'ERROR') this.element.style.color = 'red'
        else this.element.style.color = 'blue'
        setTimeout(() => this.element.textContent = '', timeout)
    }
}