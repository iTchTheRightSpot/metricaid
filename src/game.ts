import type {INotification, IPokemonApi, PokemonData} from './service.ts';

export interface GameArgs {
    timer_element: HTMLSpanElement;
    grid_wrapper: HTMLDivElement;
    rows: number
    columns: number,
}

export class Game {
    private seconds_elapsed = 0
    private timer_id = 0
    private has_game_started = false
    private readonly total_cells: number;
    private pokemon_pairs: PokemonData[] = [];
    private readonly cell_value_map = new Map<string, string>()
    private selected_cells: HTMLButtonElement[] = []
    private are_cells_locked = false

    constructor(
        private readonly args: GameArgs,
        private readonly api: IPokemonApi,
        private readonly notify: INotification
    ) {
        this.total_cells = args.rows * args.columns;
        if (this.total_cells < 1 || this.total_cells % 2 !== 0) {
            this.notify.display('ERROR', 'Please make sure dimension is divisible by 2', 150000)
            return
        }
        this.render_grid().then().catch()
    }

    private readonly start_timer = () => {
        if (this.timer_id !== 0) return
        this.timer_id = setInterval(() => {
            this.args.timer_element.innerHTML = `${this.seconds_elapsed}`
            this.seconds_elapsed += 1
        }, 1000)
    }

    private readonly render_grid = async () => {
        this.pokemon_pairs = await this.api.list_of_pokemons(this.total_cells / 2)

        const {rows, columns, grid_wrapper} = this.args;

        grid_wrapper.innerHTML = '';
        grid_wrapper.style.display = 'grid';
        grid_wrapper.style.gridTemplateRows = `repeat(${rows}, 100px)`;
        grid_wrapper.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

        for (let i = 0; i < this.total_cells; i++) {
            const button = document.createElement('button');
            button.type = 'button';
            this.args.grid_wrapper.appendChild(button);
        }
        const cells = [...this.args.grid_wrapper.children] as HTMLButtonElement[]
        this.shuffle_cell_ids(cells)
        this.setup_grid(cells)
    }

    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    private readonly shuffle_cell_ids = (cells: HTMLButtonElement[]) => {
        const ids = cells.map((_, i) => `${i}`);
        for (let i = ids.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ids[i], ids[j]] = [ids[j], ids[i]];
        }
        cells.forEach((btn, index) => btn.id = ids[index]);
    }

    private readonly setup_grid = (cells: HTMLButtonElement[]) => {
        cells.forEach(cell => {
            cell.textContent = ''
            this.cell_value_map.set(cell.id, this.pokemon_pairs[Math.floor(parseInt(cell.id) / 2)].name)
        })
        cells.forEach(this.onclick_cell)
    }

    private readonly onclick_cell = (cell: HTMLButtonElement) => {
        cell.addEventListener('click', () => {
            if (!this.has_game_started) {
                this.notify.display('ERROR', 'Please click start game to begin')
                return
            } else if (cell.textContent !== '' || this.are_cells_locked) return

            const cells = this.selected_cells;
            cell.textContent = this.cell_value_map.get(cell.id) || ''
            cells.push(cell)

            if (cells.length % 2 === 0) {
                const last = cells[cells.length - 1]
                const second_to_last = cells[cells.length - 2]
                const is_match = this.cell_value_map.get(last.id) === this.cell_value_map.get(second_to_last.id);
                if (is_match && cells.length === this.total_cells) {
                    this.notify.display('NORMAL', 'You won! Game over 🙂', 150000)
                    clearInterval(this.timer_id)
                } else if (!is_match) this.handle_mismatch(cells.pop()!, cells.pop()!)
            }
        })
    }

    private readonly handle_mismatch = (first: HTMLButtonElement, second: HTMLButtonElement) => {
        this.are_cells_locked = true;
        setTimeout(() => {
            first.textContent = '';
            second.textContent = '';
            this.are_cells_locked = false;
        }, 400);
    }

    readonly start = () => {
        this.has_game_started = true
        this.start_timer()
    }

    readonly reset = () => {
        this.has_game_started = false
        this.seconds_elapsed = 0
        clearInterval(this.timer_id)
        this.timer_id = 0

        const {timer_element, grid_wrapper} = this.args
        timer_element.innerHTML = ''

        const cells = [...grid_wrapper.children] as HTMLButtonElement[];
        cells.forEach(cell => cell.textContent = '')

        this.shuffle_cell_ids(cells)
        this.selected_cells = []
        this.are_cells_locked = false

        this.notify.display('NORMAL', '')
    }
}
