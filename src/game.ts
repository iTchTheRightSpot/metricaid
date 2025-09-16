import type {INotification, IPokemonApi, PokemonData} from './service.ts';

export interface GameArgs {
    timer_element: HTMLSpanElement;
    grid_wrapper: HTMLDivElement;
    rows: number
    columns: number,
}

export class Game {
    private timer_state = 0
    private count_up = 0
    private begin_game = false
    private readonly dimension: number;
    private pokemons: PokemonData[] = [];
    private readonly cell_cache = new Map<string, string>()
    private readonly cells_selected: HTMLButtonElement[] = []
    private lock_cells = false

    constructor(
        private readonly args: GameArgs,
        private readonly api: IPokemonApi,
        private readonly notify: INotification
    ) {
        this.dimension = args.rows * args.columns;
        this.create_grid().then().catch()
    }

    private readonly create_grid = async () => {
        this.pokemons = await this.api.list_of_pokemons(this.dimension / 2)
        this.args.grid_wrapper.innerHTML = '';
        for (let i = 0; i < this.dimension; i++) {
            const button = document.createElement('button');
            button.type = 'button';
            button.id = `cell-${i}`;
            this.args.grid_wrapper.appendChild(button);
        }
        this.setup_grid()
    }

    private readonly start_timer = () =>
        this.count_up = setInterval(() => {
            this.args.timer_element.innerHTML = `${this.timer_state}`
            this.timer_state += 1
        }, 1000)



    private readonly setup_grid = () => {
        const cells = (this.args.grid_wrapper.children as unknown) as HTMLButtonElement[]
        for (let i = 0; i < cells.length; i++) {
            cells[i].textContent = ''
            this.cell_cache.set(cells[i].id, this.pokemons[Math.floor(i / 2)].name)
        }
        console.log(this.cell_cache)
        for (const cell of cells)
            cell.addEventListener('click', () => {
                if (!this.begin_game) {
                    this.notify.display('ERROR', 'Please click start game to begin')
                    return
                }
                if (this.cells_selected.length >= this.dimension) {
                    this.notify.display('NORMAL', 'Game over by reset and start game.')
                    return
                } else if (cell.textContent !== '' || this.lock_cells) return

                cell.textContent = this.cell_cache.get(cell.id) || ''
                this.cells_selected.push(cell)
                if (this.cells_selected.length > 0 && this.cells_selected.length % 2 === 0) {
                    const last = this.cells_selected[this.cells_selected.length - 1]
                    const second_to_last = this.cells_selected[this.cells_selected.length - 2]
                    if (this.cell_cache.get(last.id) !== this.cell_cache.get(second_to_last.id)) {
                        this.lock_cells = true
                        setTimeout(() => {
                            this.cells_selected.pop()
                            this.cells_selected.pop()
                            last.textContent = ''
                            second_to_last.textContent = ''
                            this.lock_cells = false
                        }, 400)
                    }
                }
            })
    }

    readonly start = async () => {
        this.begin_game = true
        this.start_timer()
        if (this.pokemons.length < 1)
            this.pokemons = await this.api.list_of_pokemons(this.dimension / 2)
    }

    readonly reset = () => {
        this.begin_game = false
        clearInterval(this.count_up)
        this.timer_state = 0
        this.args.timer_element.innerHTML = ''
        for (const btn of this.args.grid_wrapper.children) btn.textContent = ''
        this.pokemons = []
    }
}
