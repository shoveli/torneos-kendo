"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Users, Trophy, Calendar } from "lucide-react"

interface Player {
  id: string
  name: string
}

interface Match {
  id: string
  player1: Player
  player2: Player
  result?: "player1" | "player2" | "draw"
  player1Score?: number
  player2Score?: number
  completed: boolean
}

interface Standing {
  player: Player
  matches: number
  wins: number
  draws: number
  losses: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export default function TournamentManager() {
  const [players, setPlayers] = useState<Player[]>([])
  const [newPlayerName, setNewPlayerName] = useState("")
  const [matches, setMatches] = useState<Match[]>([])
  const [tournamentStarted, setTournamentStarted] = useState(false)

  // Add a new player
  const addPlayer = () => {
    if (newPlayerName.trim() && !tournamentStarted) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
      }
      setPlayers([...players, newPlayer])
      setNewPlayerName("")
    }
  }

  // Remove a player
  const removePlayer = (playerId: string) => {
    if (!tournamentStarted) {
      setPlayers(players.filter((p) => p.id !== playerId))
    }
  }

  // Generate all vs all matches
  const generateMatches = () => {
    if (players.length < 2) return

    const newMatches: Match[] = []
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        newMatches.push({
          id: `${players[i].id}-${players[j].id}`,
          player1: players[i],
          player2: players[j],
          completed: false,
        })
      }
    }
    setMatches(newMatches)
    setTournamentStarted(true)
  }

  // Update match result
  const updateMatchResult = (
    matchId: string,
    result: "player1" | "player2" | "draw",
    player1Score: number,
    player2Score: number,
  ) => {
    setMatches(
      matches.map((match) =>
        match.id === matchId ? { ...match, result, player1Score, player2Score, completed: true } : match,
      ),
    )
  }

  // Calculate standings
  const calculateStandings = (): Standing[] => {
    const standings: Standing[] = players.map((player) => ({
      player,
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    }))

    matches.forEach((match) => {
      if (match.completed && match.result && match.player1Score !== undefined && match.player2Score !== undefined) {
        const player1Standing = standings.find((s) => s.player.id === match.player1.id)!
        const player2Standing = standings.find((s) => s.player.id === match.player2.id)!

        player1Standing.matches++
        player2Standing.matches++

        player1Standing.goalsFor += match.player1Score
        player1Standing.goalsAgainst += match.player2Score
        player2Standing.goalsFor += match.player2Score
        player2Standing.goalsAgainst += match.player1Score

        if (match.result === "player1") {
          player1Standing.wins++
          player1Standing.points += 3
          player2Standing.losses++
        } else if (match.result === "player2") {
          player2Standing.wins++
          player2Standing.points += 3
          player1Standing.losses++
        } else if (match.result === "draw") {
          player1Standing.draws++
          player1Standing.points += 1
          player2Standing.draws++
          player2Standing.points += 1
        }
      }
    })

    // Calculate goal difference
    standings.forEach((standing) => {
      standing.goalDifference = standing.goalsFor - standing.goalsAgainst
    })

    return standings.sort(
      (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor,
    )
  }

  // Reset tournament
  const resetTournament = () => {
    setMatches([])
    setTournamentStarted(false)
  }

  const standings = calculateStandings()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="flex-shrink-0">
              <img
                src="/images/kuma-kai-logo.jpg"
                alt="Kuma Kai Dojo"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Torneo Kuma Kai</h1>
              <p className="text-lg text-gray-600">A reventarse</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Jugadores
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Combates
            </TabsTrigger>
            <TabsTrigger value="standings" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Clasificación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agregar KumaKenshis</CardTitle>
                <CardDescription>Se necesitan al menos dos kenshis para comenzar el torneo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!tournamentStarted && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre del kenshi"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addPlayer()}
                    />
                    <Button onClick={addPlayer} disabled={!newPlayerName.trim()}>
                      Agregar
                    </Button>
                  </div>
                )}

                <div className="grid gap-2">
                  {players.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      {!tournamentStarted && (
                        <Button variant="outline" size="sm" onClick={() => removePlayer(player.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {players.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No se han agregado kenshis todavía</p>
                )}

                {!tournamentStarted && players.length >= 2 && (
                  <Button onClick={generateMatches} className="w-full" size="lg">
                    Iniciar Torneo ({players.length} kenshis, {(players.length * (players.length - 1)) / 2} peleas)
                  </Button>
                )}

                {tournamentStarted && (
                  <div className="flex gap-2">
                    <Button onClick={resetTournament} variant="outline" className="flex-1">
                      Reiniciar Torneo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resultados de los combates</CardTitle>
                <CardDescription>
                  Ingresa el ganador y la puntuación de cada combate. Victoria = 3 puntos, Empate = 1 punto, Derrota = 0
                  puntos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No se han generado combates aún. Primero agrega kenshis e inicia el torneo.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <MatchResultCard key={match.id} match={match} onUpdateResult={updateMatchResult} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="standings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clasificación del Torneo</CardTitle>
                <CardDescription>
                  Clasificación actual basada en puntos obtenidos (Victoria: 3pts, Empate: 1pt, Derrota: 0pts)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {standings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay clasificación disponible. Inicia el torneo e ingresa los resultados de los combates.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Pos</TableHead>
                        <TableHead>Jugador</TableHead>
                        <TableHead className="text-center">PJ</TableHead>
                        <TableHead className="text-center">G</TableHead>
                        <TableHead className="text-center">E</TableHead>
                        <TableHead className="text-center">P</TableHead>
                        <TableHead className="text-center">PF</TableHead>
                        <TableHead className="text-center">PE</TableHead>
                        <TableHead className="text-center">DIFF</TableHead>
                        <TableHead className="text-center font-bold">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standings.map((standing, index) => (
                        <TableRow key={standing.player.id}>
                          <TableCell>
                            <Badge variant={index === 0 ? "default" : "secondary"}>{index + 1}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{standing.player.name}</TableCell>
                          <TableCell className="text-center">{standing.matches}</TableCell>
                          <TableCell className="text-center">{standing.wins}</TableCell>
                          <TableCell className="text-center">{standing.draws}</TableCell>
                          <TableCell className="text-center">{standing.losses}</TableCell>
                          <TableCell className="text-center">{standing.goalsFor}</TableCell>
                          <TableCell className="text-center">{standing.goalsAgainst}</TableCell>
                          <TableCell className="text-center">
                            <span className={standing.goalDifference >= 0 ? "text-green-600" : "text-red-600"}>
                              {standing.goalDifference > 0 ? "+" : ""}
                              {standing.goalDifference}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-bold">{standing.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Animated Footer */}
      <footer className="bg-gradient-to-r from-blue-500 to-teal-500 text-white py-4 mt-8">
        <div className="container mx-auto text-center">
          <div className="animate-pulse text-lg font-medium">💙 los quiere mucho, shove :) 💙</div>
        </div>
      </footer>
    </div>
  )
}

// Match Result Card Component
function MatchResultCard({
  match,
  onUpdateResult,
}: {
  match: Match
  onUpdateResult: (
    matchId: string,
    result: "player1" | "player2" | "draw",
    player1Score: number,
    player2Score: number,
  ) => void
}) {
  const [player1Score, setPlayer1Score] = useState(match.player1Score?.toString() || "")
  const [player2Score, setPlayer2Score] = useState(match.player2Score?.toString() || "")
  const [winner, setWinner] = useState(match.result || "")

  const handleSubmit = () => {
    const p1Score = Number.parseInt(player1Score) || 0
    const p2Score = Number.parseInt(player2Score) || 0

    let result: "player1" | "player2" | "draw"
    if (p1Score > p2Score) {
      result = "player1"
    } else if (p2Score > p1Score) {
      result = "player2"
    } else {
      result = "draw"
    }

    onUpdateResult(match.id, result, p1Score, p2Score)
    setWinner(result)
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-4">
        <span className="font-medium">{match.player1.name}</span>
        <span className="text-muted-foreground">vs</span>
        <span className="font-medium">{match.player2.name}</span>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="0"
          value={player1Score}
          onChange={(e) => setPlayer1Score(e.target.value)}
          className="w-16 text-center"
          min="0"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          placeholder="0"
          value={player2Score}
          onChange={(e) => setPlayer2Score(e.target.value)}
          className="w-16 text-center"
          min="0"
        />
        <Button onClick={handleSubmit} size="sm" className="ml-2">
          Guardar
        </Button>
        {match.completed && (
          <Badge variant={match.result === "draw" ? "secondary" : "default"} className="ml-2">
            {match.result === "player1"
              ? `Ganó ${match.player1.name}`
              : match.result === "player2"
                ? `Ganó ${match.player2.name}`
                : "Empate"}{" "}
            ({match.player1Score}-{match.player2Score})
          </Badge>
        )}
      </div>
    </div>
  )
}
