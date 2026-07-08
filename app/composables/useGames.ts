import type { Game } from '~/types/games'
import { useApi } from './core/useApi'

export const useGames = () => {
  const { api } = useApi()

  const games = ref<Game[]>([])

  const getGames = async () => {
    const res = await api<{ games: Game[] }>('/games', {
      method: 'GET'
    })

    games.value = res.games
    return res.games
  }

  return {
    games,
    getGames
  }
}