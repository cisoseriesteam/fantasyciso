import React, { useState } from 'react';
import { Shield, Users, Swords, Settings, Play, RefreshCw, ChevronRight, AlertTriangle, Undo, Crown, Download, CheckCircle, XCircle } from 'lucide-react';

const SHEET_ID = '1JVEiS27XB6EljjtuCDHMuMUr1QsovenocYNeLtTphic';
const API_KEY = 'AIzaSyDOnxBSuAXEkfYZn1l1ApVmjxKR_0cC5W8';
const SHEET_NAME = 'Sheet2';

const colors = {
  teal: '#009999', blue: '#006699', purple: '#663366',
  red: '#ca2127', orange: '#ff6600', yellow: '#ffcc00', green: '#0d9948',
};

export default function FantasyCISOGame() {
  const [gamePhase, setGamePhase] = useState('setup');
  const [players, setPlayers] = useState([]);
  const [controls, setControls] = useState([]);
  const [attacks, setAttacks] = useState([]);
  const [pasteJSON, setPasteJSON] = useState('');
  const [loadStatus, setLoadStatus] = useState('idle'); // idle | success | error
  const [loadError, setLoadError] = useState('');

  const [selectionsPerPlayer, setSelectionsPerPlayer] = useState(4);
  const [playerSelections, setPlayerSelections] = useState({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [remainingControls, setRemainingControls] = useState([]);
  const [selectionHistory, setSelectionHistory] = useState([]);
  const [allSelectionsComplete, setAllSelectionsComplete] = useState(false);
  const [currentAttack, setCurrentAttack] = useState(null);
  const [crownedPlayer, setCrownedPlayer] = useState(null);
  const [setupError, setSetupError] = useState(null);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [editingControls, setEditingControls] = useState(false);
  const [editingAttacks, setEditingAttacks] = useState(false);
  const [newControl, setNewControl] = useState('');
  const [newAttack, setNewAttack] = useState('');

  const loadFromJSON = () => {
    try {
      const { PLAYERS, CONTROLS, ATTACKS } = JSON.parse(pasteJSON);
      if (!PLAYERS?.length && !CONTROLS?.length && !ATTACKS?.length)
        throw new Error('No data found. Check that your JSON has PLAYERS, CONTROLS, and ATTACKS keys.');
      setPlayers(PLAYERS || []);
      setControls(CONTROLS || []);
      setAttacks(ATTACKS || []);
      setLoadStatus('success');
      setPasteJSON('');
    } catch (e) {
      setLoadStatus('error');
      setLoadError(e.message || 'Invalid JSON');
    }
  };

  const startSelection = () => {
    setSetupError(null);
    if (!players.length) return setSetupError('No players loaded.');
    if (!controls.length) return setSetupError('No controls loaded.');
    if (!attacks.length) return setSetupError('No attacks loaded.');
    const required = players.length * selectionsPerPlayer;
    if (controls.length < required)
      return setSetupError(`Need ${required} controls for ${players.length} players × ${selectionsPerPlayer} picks, but only ${controls.length} available.`);
    const initialSelections = {};
    players.forEach(p => { initialSelections[p] = []; });
    setPlayerSelections(initialSelections);
    setRemainingControls([...controls]);
    setCurrentPlayerIndex(0);
    setSelectionHistory([]);
    setAllSelectionsComplete(false);
    setGamePhase('selection');
  };

  const selectControl = (control) => {
    const currentPlayer = players[currentPlayerIndex];
    setSelectionHistory(h => [...h, { playerIndex: currentPlayerIndex, control, selections: { ...playerSelections }, remaining: [...remainingControls] }]);
    const newSel = { ...playerSelections, [currentPlayer]: [...playerSelections[currentPlayer], control] };
    setPlayerSelections(newSel);
    const newRemaining = remainingControls.filter(c => c !== control);
    setRemainingControls(newRemaining);
    const allDone = players.every(p => newSel[p].length === selectionsPerPlayer);
    if (allDone) setAllSelectionsComplete(true);
    else setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
  };

  const undoLastSelection = () => {
    if (!selectionHistory.length) return;
    const last = selectionHistory[selectionHistory.length - 1];
    setPlayerSelections(last.selections);
    setRemainingControls(last.remaining);
    setCurrentPlayerIndex(last.playerIndex);
    setSelectionHistory(h => h.slice(0, -1));
    setAllSelectionsComplete(false);
  };

  const resetGame = () => {
    setGamePhase('setup');
    setPlayerSelections({});
    setCurrentPlayerIndex(0);
    setCurrentAttack(null);
    setSelectionHistory([]);
    setAllSelectionsComplete(false);
    setCrownedPlayer(null);
    setSetupError(null);
    setLoadStatus('idle');
    setLoadError('');
  };

  // ── SETUP ─────────────────────────────────────────────────────────────────
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen p-8" style={{ background: `linear-gradient(to bottom right, #0f172a, ${colors.blue}, #0f172a)` }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield className="w-12 h-12" style={{ color: colors.teal }} />
              <h1 className="text-5xl font-bold text-white">Fantasy CISO</h1>
            </div>
          </div>

          {/* Load from JSON */}
          <div className="bg-slate-800/50 backdrop-blur p-6 mb-6" style={{ border: `1px solid ${colors.teal}4D` }}>
            <div className="flex items-center gap-3 mb-2">
              <Download className="w-6 h-6" style={{ color: colors.teal }} />
              <h2 className="text-2xl font-bold text-white">Load Game Data</h2>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Run the macro in your <a href="https://docs.google.com/spreadsheets/d/1JVEiS27XB6EljjtuCDHMuMUr1QsovenocYNeLtTphic/edit?usp=sharing" target="_blank" rel="noopener noreferrer" style={{ color: colors.teal, textDecoration: 'underline' }}>Google Sheet</a>, then paste the JSON below.
            </p>
            <textarea
              value={pasteJSON}
              onChange={e => { setPasteJSON(e.target.value); setLoadStatus('idle'); }}
              placeholder='{"PLAYERS":[...],"CONTROLS":[...],"ATTACKS":[...]}'
              className="w-full bg-slate-700 text-white p-3 text-sm font-mono mb-4 h-24 resize-none"
            />
            <div className="flex items-center gap-4">
              <button
                onClick={loadFromJSON}
                disabled={!pasteJSON.trim() || loadStatus === 'success'}
                className="text-white py-3 px-6 font-bold text-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: colors.teal }}
              >
                <Download className="w-5 h-5" /> Load Data
              </button>
              {loadStatus === 'success' && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" style={{ color: colors.green }} />
                  <span className="text-sm" style={{ color: colors.green }}>
                    Loaded — {players.length} players, {controls.length} controls, {attacks.length} attacks
                  </span>
                </div>
              )}
              {loadStatus === 'error' && (
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" style={{ color: colors.red }} />
                  <span className="text-sm" style={{ color: colors.red }}>{loadError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Players */}
          <div className="bg-slate-800/50 backdrop-blur p-6 mb-6" style={{ border: `1px solid ${colors.teal}4D` }}>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6" style={{ color: colors.teal }} />
              <h2 className="text-2xl font-bold text-white">Players</h2>
              <span className="ml-auto text-slate-400 text-sm">{players.length} loaded</span>
            </div>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {players.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-700/50 p-3">
                  <input type="text" value={p}
                    onChange={e => { const np = [...players]; np[i] = e.target.value; setPlayers(np); }}
                    className="bg-transparent text-white text-lg flex-1 outline-none" />
                  <button onClick={() => setPlayers(players.filter((_, j) => j !== i))} style={{ color: colors.red }}>✕</button>
                </div>
              ))}
              {!players.length && <p className="text-slate-500 text-sm italic">No players — load JSON or add manually.</p>}
            </div>
            {showAddPlayer ? (
              <div className="flex gap-2">
                <input type="text" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)}
                  onKeyPress={e => { if (e.key === 'Enter' && newPlayerName.trim()) { setPlayers([...players, newPlayerName.trim()]); setNewPlayerName(''); setShowAddPlayer(false); }}}
                  placeholder="Player name…" className="flex-1 bg-slate-700 text-white p-2" autoFocus />
                <button onClick={() => { if (newPlayerName.trim()) { setPlayers([...players, newPlayerName.trim()]); setNewPlayerName(''); setShowAddPlayer(false); }}} className="text-white px-4" style={{ backgroundColor: colors.orange }}>Add</button>
                <button onClick={() => { setNewPlayerName(''); setShowAddPlayer(false); }} className="bg-slate-600 text-white px-4">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowAddPlayer(true)} className="text-white py-2 px-4 font-semibold hover:opacity-90" style={{ backgroundColor: colors.orange }}>+ Add Player</button>
            )}
            <div className="mt-4">
              <label className="block text-white mb-1 text-sm">Controls per player</label>
              <input type="number" min="1" max="10" value={selectionsPerPlayer}
                onChange={e => setSelectionsPerPlayer(parseInt(e.target.value) || 1)}
                className="bg-slate-700 text-white p-2 w-24" />
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-800/50 backdrop-blur p-6 mb-6" style={{ border: `1px solid ${colors.teal}4D` }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-6 h-6" style={{ color: colors.teal }} />
              <h2 className="text-2xl font-bold text-white">Security Controls</h2>
              <button onClick={() => setEditingControls(!editingControls)} className="ml-auto" style={{ color: colors.teal }}><Settings className="w-5 h-5" /></button>
              <span className="text-slate-400 text-sm">{controls.length} loaded</span>
            </div>
            {editingControls ? (
              <div>
                <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
                  {controls.map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-700/50 p-2 text-sm">
                      <span className="text-white">{c}</span>
                      <button onClick={() => setControls(controls.filter((_, j) => j !== i))} style={{ color: colors.red }}>✕</button>
                    </div>
                  ))}
                  {!controls.length && <p className="text-slate-500 text-sm italic">No controls loaded.</p>}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newControl} onChange={e => setNewControl(e.target.value)}
                    onKeyPress={e => { if (e.key === 'Enter' && newControl.trim()) { setControls([...controls, newControl.trim()]); setNewControl(''); }}}
                    placeholder="New control…" className="flex-1 bg-slate-700 text-white p-2" />
                  <button onClick={() => { if (newControl.trim()) { setControls([...controls, newControl.trim()]); setNewControl(''); }}} className="text-white px-4" style={{ backgroundColor: colors.orange }}>Add</button>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">{controls.length ? `${controls[0]}${controls.length > 1 ? `, +${controls.length - 1} more…` : ''}` : 'No controls — load JSON or add via ⚙'}</p>
            )}
          </div>

          {/* Attacks */}
          <div className="bg-slate-800/50 backdrop-blur p-6 mb-8" style={{ border: `1px solid ${colors.red}4D` }}>
            <div className="flex items-center gap-2 mb-2">
              <Swords className="w-6 h-6" style={{ color: colors.red }} />
              <h2 className="text-2xl font-bold text-white">Attack Scenarios</h2>
              <button onClick={() => setEditingAttacks(!editingAttacks)} className="ml-auto" style={{ color: colors.teal }}><Settings className="w-5 h-5" /></button>
              <span className="text-slate-400 text-sm">{attacks.length} loaded</span>
            </div>
            {editingAttacks ? (
              <div>
                <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
                  {attacks.map((a, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-700/50 p-2 text-sm">
                      <span className="text-white">{a}</span>
                      <button onClick={() => setAttacks(attacks.filter((_, j) => j !== i))} style={{ color: colors.red }}>✕</button>
                    </div>
                  ))}
                  {!attacks.length && <p className="text-slate-500 text-sm italic">No attacks loaded.</p>}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newAttack} onChange={e => setNewAttack(e.target.value)}
                    onKeyPress={e => { if (e.key === 'Enter' && newAttack.trim()) { setAttacks([...attacks, newAttack.trim()]); setNewAttack(''); }}}
                    placeholder="New attack…" className="flex-1 bg-slate-700 text-white p-2" />
                  <button onClick={() => { if (newAttack.trim()) { setAttacks([...attacks, newAttack.trim()]); setNewAttack(''); }}} className="text-white px-4" style={{ backgroundColor: colors.orange }}>Add</button>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">{attacks.length ? `${attacks[0].slice(0, 80)}${attacks[0].length > 80 ? '…' : ''}${attacks.length > 1 ? ` +${attacks.length - 1} more` : ''}` : 'No attacks — load JSON or add via ⚙'}</p>
            )}
          </div>

          {setupError && (
            <div className="mb-4 p-4 flex items-start gap-3" style={{ backgroundColor: `${colors.red}33`, border: `1px solid ${colors.red}` }}>
              <AlertTriangle className="w-6 h-6 mt-0.5 shrink-0" style={{ color: colors.yellow }} />
              <p className="text-white">{setupError}</p>
            </div>
          )}

          <button onClick={startSelection} className="w-full text-white py-4 text-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90" style={{ backgroundColor: colors.orange }}>
            <Play className="w-8 h-8" /> Start Game
          </button>
        </div>
      </div>
    );
  }

  // ── SELECTION ─────────────────────────────────────────────────────────────
  if (gamePhase === 'selection') {
    const currentPlayer = players[currentPlayerIndex];
    return (
      <div className="min-h-screen p-8" style={{ background: `linear-gradient(to bottom right, #0f172a, ${colors.blue}, #0f172a)` }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-12 h-12" style={{ color: colors.teal }} />
              <h1 className="text-5xl font-bold text-white">Fantasy CISO</h1>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Choose your controls</h2>
            {allSelectionsComplete && (
              <button onClick={() => { setCurrentAttack(attacks[Math.floor(Math.random() * attacks.length)]); setGamePhase('attack'); }}
                className="mt-4 text-white py-4 px-10 text-2xl font-bold flex items-center gap-3 mx-auto shadow-2xl hover:opacity-90" style={{ backgroundColor: colors.orange }}>
                <Swords className="w-8 h-8" /> Reveal Attack <Swords className="w-8 h-8" />
              </button>
            )}
          </div>
          <div className="bg-slate-800/50 backdrop-blur p-6 mb-8" style={{ border: `1px solid ${colors.purple}4D` }}>
            <div className="flex items-center justify-between mb-4" style={{ minHeight: '44px' }}>
              <h3 className="text-xl font-bold text-white">Current Selections</h3>
              {selectionHistory.length > 0 && (
                <button onClick={undoLastSelection} className="text-white py-2 px-4 font-semibold flex items-center gap-2 hover:opacity-90" style={{ backgroundColor: colors.orange }}>
                  <Undo className="w-4 h-4" /> Undo Last Pick
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {players.map(player => {
                const sels = playerSelections[player] || [];
                const isCurrent = player === currentPlayer && !allSelectionsComplete;
                return (
                  <div key={player} className="p-4" style={{ backgroundColor: isCurrent ? `${colors.purple}66` : 'rgba(51,65,85,0.5)', border: isCurrent ? `2px solid ${colors.purple}` : 'none', minHeight: '120px' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-bold text-lg">{player}</div>
                      <div className="text-sm text-white">{sels.length}/{selectionsPerPlayer} picked</div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {sels.map((c, i) => <div key={i} className="text-white px-3 py-1.5 font-semibold text-sm" style={{ backgroundColor: colors.teal }}>{c}</div>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {!allSelectionsComplete && (
            <div className="bg-slate-800/50 backdrop-blur p-6" style={{ border: `1px solid ${colors.purple}4D` }}>
              <h3 className="text-2xl font-bold text-white mb-6">Available Controls — <span style={{ color: colors.purple }}>{currentPlayer}'s pick</span></h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {remainingControls.map(control => (
                  <button key={control} onClick={() => selectControl(control)}
                    className="text-white p-4 font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:opacity-90" style={{ backgroundColor: colors.teal }}>
                    {control}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="text-center mt-8">
            <button onClick={resetGame} className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white py-2 px-4 text-sm font-semibold inline-flex items-center gap-2">
              <RefreshCw className="w-3 h-3" /> Reset game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ATTACK ────────────────────────────────────────────────────────────────
  if (gamePhase === 'attack') {
    return (
      <div className="min-h-screen p-8" style={{ background: `linear-gradient(to bottom right, #0f172a, ${colors.red}, #0f172a)` }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-12 h-12" style={{ color: colors.teal }} />
              <h1 className="text-5xl font-bold text-white">Fantasy CISO</h1>
            </div>
          </div>
          <div className="p-8 mb-12 shadow-2xl" style={{ backgroundColor: colors.red, border: '4px solid black' }}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <AlertTriangle className="w-12 h-12 animate-pulse" style={{ color: colors.yellow }} />
              <h2 className="text-3xl font-bold text-white">INCOMING ATTACK</h2>
              <AlertTriangle className="w-12 h-12 animate-pulse" style={{ color: colors.yellow }} />
            </div>
            <p className="text-4xl font-bold text-white text-center">{currentAttack}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {players.map(player => (
              <div key={player} onClick={() => setCrownedPlayer(crownedPlayer === player ? null : player)}
                className="relative bg-slate-800/70 backdrop-blur p-6 shadow-xl cursor-pointer hover:shadow-2xl" style={{ border: '2px solid black' }}>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6" /> {player}
                  {crownedPlayer === player && <Crown className="w-6 h-6" style={{ color: colors.yellow, fill: colors.yellow }} />}
                </h3>
                <div className="space-y-2">
                  {playerSelections[player].map((c, i) => (
                    <div key={i} className="text-white px-4 py-3 font-semibold text-lg" style={{ backgroundColor: colors.teal }}>{c}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setCurrentAttack(attacks[Math.floor(Math.random() * attacks.length)])}
              className="text-white py-4 px-8 text-xl font-bold flex items-center gap-3 shadow-lg hover:opacity-90" style={{ backgroundColor: colors.orange }}>
              <RefreshCw className="w-6 h-6" /> New Attack
            </button>
            <button onClick={resetGame} className="bg-slate-600 hover:bg-slate-700 text-white py-4 px-8 text-xl font-bold flex items-center gap-3 shadow-lg">
              <ChevronRight className="w-6 h-6" /> New Game
            </button>
          </div>
        </div>
      </div>
    );
  }
}
