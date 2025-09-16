import { NotificationImpl, PokemonApiImpl} from './service.ts';
import { Game } from './game.ts'

document.addEventListener('DOMContentLoaded', () => {
    const timer_element = document.getElementById('count-up')
    const grid_element = document.getElementsByClassName('wrapper')
    const start_btn = document.getElementById('start')
    const reset_btn = document.getElementById('reset')
    const notification_element = document.getElementById('notification')

    if (timer_element && grid_element && reset_btn && start_btn && notification_element) {
        const notification = new NotificationImpl(notification_element);
        const api = new PokemonApiImpl(notification)
        const args = {
            timer_element: timer_element,
            grid_wrapper: grid_element[0] as HTMLDivElement,
            rows: 1,
            columns: 2,
        }
        const game = new Game(args, api, notification)
        start_btn.addEventListener('click', async () => { await game.start() })
        reset_btn.addEventListener('click', () => game.reset())
    }
})