const {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} = React;
window.storage = {
  async get(key) {
    const raw = localStorage.getItem("aot_" + key);
    if (raw === null) return null;
    return {
      key,
      value: raw,
      shared: false
    };
  },
  async set(key, value) {
    localStorage.setItem("aot_" + key, value);
    return {
      key,
      value,
      shared: false
    };
  },
  async delete(key) {
    localStorage.removeItem("aot_" + key);
    return {
      key,
      deleted: true,
      shared: false
    };
  },
  async list(prefix) {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("aot_" + (prefix || ""))).map(k => k.slice(4));
    return {
      keys,
      shared: false
    };
  }
};

// ================= AOT brand tokens (rood - wit - zwart) =================
const COLORS = {
  bg: "#121110",
  surface: "#1B1917",
  surfaceRaised: "#242220",
  border: "#37332E",
  borderSoft: "#282521",
  text: "#F7F4EE",
  textMuted: "#A69E92",
  textFaint: "#6C645A",
  accent: "#CF5550",
  // AOT rood — gemeten uit logo.eps (CMYK 14/77/63/3)
  accentDark: "#803532",
  accentSoft: "#CF555022",
  white: "#FFFFFF",
  danger: "#CF5550"
};
const displayFont = '"Arial Narrow", "Helvetica Neue Condensed", "Roboto Condensed", Arial, sans-serif';
const bodyFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
const monoFont = '"SF Mono", "Roboto Mono", "Courier New", monospace';
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = iso => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};
const fmtDuration = sec => {
  const s = Number(sec) || 0;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
};

// ================= muscle groups & exercise library =================
const MUSCLE_GROUPS = [{
  id: "upper_front",
  label: "Bovenlichaam · Voorzijde",
  short: "BL-V"
}, {
  id: "upper_back",
  label: "Bovenlichaam · Achterzijde",
  short: "BL-A"
}, {
  id: "lower_front",
  label: "Onderlichaam · Voorzijde",
  short: "OL-V"
}, {
  id: "lower_back",
  label: "Onderlichaam · Achterzijde",
  short: "OL-A"
}];
const groupLabel = id => MUSCLE_GROUPS.find(g => g.id === id)?.label || id;
const groupShort = id => MUSCLE_GROUPS.find(g => g.id === id)?.short || id;
const BLOCK_TYPES = [{
  id: "single",
  label: "Los"
}, {
  id: "superset",
  label: "Superset"
}, {
  id: "triset",
  label: "Triset"
}, {
  id: "circuit",
  label: "Circuit"
}];
const DEFAULT_LIBRARY = [
// Bovenlichaam - voorzijde
{
  id: "ex_pushup",
  name: "Push-up",
  groups: ["upper_front"]
}, {
  id: "ex_bench",
  name: "Bench press",
  groups: ["upper_front"]
}, {
  id: "ex_incline_db",
  name: "Incline dumbbell press",
  groups: ["upper_front"]
}, {
  id: "ex_chest_fly",
  name: "Chest fly",
  groups: ["upper_front"]
}, {
  id: "ex_ohp",
  name: "Overhead press",
  groups: ["upper_front"]
}, {
  id: "ex_arnold",
  name: "Arnold press",
  groups: ["upper_front"]
}, {
  id: "ex_curl",
  name: "Biceps curl",
  groups: ["upper_front"]
}, {
  id: "ex_hammer_curl",
  name: "Hammer curl",
  groups: ["upper_front"]
}, {
  id: "ex_crunch",
  name: "Crunch",
  groups: ["upper_front"]
}, {
  id: "ex_plank",
  name: "Plank",
  groups: ["upper_front"]
}, {
  id: "ex_dips",
  name: "Dips",
  groups: ["upper_front"]
},
// Bovenlichaam - achterzijde
{
  id: "ex_pullup",
  name: "Pull-up",
  groups: ["upper_back"]
}, {
  id: "ex_lat_pulldown",
  name: "Lat pulldown",
  groups: ["upper_back"]
}, {
  id: "ex_row",
  name: "Bent-over row",
  groups: ["upper_back"]
}, {
  id: "ex_seated_row",
  name: "Seated cable row",
  groups: ["upper_back"]
}, {
  id: "ex_face_pull",
  name: "Face pull",
  groups: ["upper_back"]
}, {
  id: "ex_reverse_fly",
  name: "Reverse fly",
  groups: ["upper_back"]
}, {
  id: "ex_shrug",
  name: "Shrug",
  groups: ["upper_back"]
}, {
  id: "ex_tricep_pushdown",
  name: "Triceps pushdown",
  groups: ["upper_back"]
}, {
  id: "ex_tricep_ext",
  name: "Triceps extension",
  groups: ["upper_back"]
}, {
  id: "ex_superman",
  name: "Superman",
  groups: ["upper_back"]
}, {
  id: "ex_deadlift",
  name: "Deadlift",
  groups: ["upper_back", "lower_back"]
}, {
  id: "ex_farmers_carry",
  name: "Farmer's carry",
  groups: ["upper_back", "lower_back"]
},
// Onderlichaam - voorzijde
{
  id: "ex_squat",
  name: "Squat",
  groups: ["lower_front"]
}, {
  id: "ex_front_squat",
  name: "Front squat",
  groups: ["lower_front"]
}, {
  id: "ex_goblet_squat",
  name: "Goblet squat",
  groups: ["lower_front"]
}, {
  id: "ex_lunges",
  name: "Lunges",
  groups: ["lower_front"]
}, {
  id: "ex_bulgarian",
  name: "Bulgarian split squat",
  groups: ["lower_front"]
}, {
  id: "ex_leg_ext",
  name: "Leg extension",
  groups: ["lower_front"]
}, {
  id: "ex_stepup",
  name: "Step-up",
  groups: ["lower_front"]
}, {
  id: "ex_wallsit",
  name: "Wall sit",
  groups: ["lower_front"]
}, {
  id: "ex_boxjump",
  name: "Box jump",
  groups: ["lower_front"]
}, {
  id: "ex_legpress",
  name: "Leg press",
  groups: ["lower_front"]
}, {
  id: "ex_mountainclimber",
  name: "Mountain climber",
  groups: ["lower_front", "upper_front"]
}, {
  id: "ex_burpee",
  name: "Burpee",
  groups: ["lower_front", "upper_front"]
},
// Onderlichaam - achterzijde
{
  id: "ex_rdl",
  name: "Romanian deadlift",
  groups: ["lower_back"]
}, {
  id: "ex_hipthrust",
  name: "Hip thrust",
  groups: ["lower_back"]
}, {
  id: "ex_glutebridge",
  name: "Glute bridge",
  groups: ["lower_back"]
}, {
  id: "ex_legcurl",
  name: "Leg curl",
  groups: ["lower_back"]
}, {
  id: "ex_calfraise",
  name: "Calf raise",
  groups: ["lower_back"]
}, {
  id: "ex_goodmorning",
  name: "Good morning",
  groups: ["lower_back"]
}, {
  id: "ex_kb_swing",
  name: "Kettlebell swing",
  groups: ["lower_back", "upper_back"]
}, {
  id: "ex_nordic",
  name: "Nordic curl",
  groups: ["lower_back"]
}, {
  id: "ex_sumo_dl",
  name: "Sumo deadlift",
  groups: ["lower_back"]
}, {
  id: "ex_singleleg_dl",
  name: "Single-leg deadlift",
  groups: ["lower_back"]
}];

// ================= storage helpers =================
async function loadClientsList() {
  try {
    const res = await window.storage.get("clients-list", false);
    return res ? JSON.parse(res.value) : [];
  } catch {
    return [];
  }
}
async function saveClientsList(list) {
  try {
    await window.storage.set("clients-list", JSON.stringify(list), false);
  } catch (e) {
    console.error("Kon klantenlijst niet opslaan", e);
  }
}
function normalizeSession(s) {
  if (s && Array.isArray(s.blocks)) {
    return {
      ...s,
      blocks: s.blocks.map(b => ({
        ...b,
        exercises: (b.exercises || []).map(ex => ({
          ...ex,
          mode: ex.mode || "reps",
          notes: ex.notes || "",
          sets: ex.sets || []
        }))
      }))
    };
  }
  // legacy sessions (pre-supersets) stored a flat "exercises" array — wrap it in a single block
  if (s && Array.isArray(s.exercises)) {
    return {
      ...s,
      blocks: [{
        id: uid(),
        type: "single",
        exercises: s.exercises.map(ex => ({
          ...ex,
          mode: ex.mode || "reps",
          notes: ex.notes || "",
          sets: ex.sets || []
        }))
      }]
    };
  }
  return {
    ...s,
    blocks: []
  };
}
async function loadClientData(id) {
  try {
    const res = await window.storage.get(`client-data:${id}`, false);
    const data = res ? JSON.parse(res.value) : {
      sessions: [],
      measurements: []
    };
    return {
      sessions: (data.sessions || []).map(normalizeSession),
      measurements: data.measurements || []
    };
  } catch {
    return {
      sessions: [],
      measurements: []
    };
  }
}
async function saveClientData(id, data) {
  try {
    await window.storage.set(`client-data:${id}`, JSON.stringify(data), false);
  } catch (e) {
    console.error("Kon klantdata niet opslaan", e);
  }
}
async function loadLibraryState() {
  try {
    const res = await window.storage.get("exercise-library", false);
    return res ? JSON.parse(res.value) : {
      hiddenIds: [],
      customExercises: [],
      order: {}
    };
  } catch {
    return {
      hiddenIds: [],
      customExercises: [],
      order: {}
    };
  }
}
async function saveLibraryState(state) {
  try {
    await window.storage.set("exercise-library", JSON.stringify(state), false);
  } catch (e) {
    console.error("Kon bibliotheek niet opslaan", e);
  }
}
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}
function downloadFile(filename, content, mime = "text/html") {
  const blob = new Blob([content], {
    type: mime
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ================= small UI atoms =================
function Btn({
  children,
  onClick,
  variant = "solid",
  type = "button",
  disabled,
  style
}) {
  const base = {
    fontFamily: bodyFont,
    fontSize: 13,
    fontWeight: 700,
    padding: "9px 16px",
    borderRadius: 6,
    cursor: disabled ? "default" : "pointer",
    border: "1px solid transparent",
    transition: "opacity .15s ease",
    opacity: disabled ? 0.5 : 1,
    ...style
  };
  const variants = {
    solid: {
      background: COLORS.accent,
      color: COLORS.white
    },
    ghost: {
      background: "transparent",
      color: COLORS.text,
      border: `1px solid ${COLORS.border}`
    },
    danger: {
      background: "transparent",
      color: COLORS.accent,
      border: `1px solid ${COLORS.accent}55`
    },
    subtle: {
      background: COLORS.surfaceRaised,
      color: COLORS.textMuted,
      border: `1px solid ${COLORS.border}`
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    onClick: onClick,
    disabled: disabled,
    style: {
      ...base,
      ...variants[variant]
    },
    onMouseEnter: e => e.currentTarget.style.opacity = disabled ? 0.5 : 0.85,
    onMouseLeave: e => e.currentTarget.style.opacity = disabled ? 0.5 : 1
  }, children);
}
function Input({
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("input", {
    ...props,
    style: {
      fontFamily: bodyFont,
      fontSize: 13,
      background: COLORS.bg,
      color: COLORS.text,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 5,
      padding: "8px 10px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      ...style
    }
  });
}
function Label({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: bodyFont,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: COLORS.textFaint,
      marginBottom: 4
    }
  }, children);
}
function SectionTitle({
  children,
  sub
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: displayFont,
      fontWeight: 800,
      fontSize: 22,
      letterSpacing: "0.01em",
      textTransform: "uppercase",
      color: COLORS.text,
      margin: 0
    }
  }, children), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: bodyFont,
      fontSize: 12.5,
      color: COLORS.textMuted,
      marginTop: 3
    }
  }, sub));
}
function Segmented({
  options,
  value,
  onChange,
  size = "sm"
}) {
  const pad = size === "sm" ? "5px 10px" : "7px 13px";
  const fs = size === "sm" ? 11.5 : 13;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      border: `1px solid ${COLORS.border}`,
      borderRadius: 6,
      overflow: "hidden"
    }
  }, options.map(opt => {
    const active = opt.id === value;
    return /*#__PURE__*/React.createElement("div", {
      key: opt.id,
      onClick: () => onChange(opt.id),
      style: {
        padding: pad,
        fontSize: fs,
        fontWeight: 700,
        cursor: "pointer",
        color: active ? COLORS.white : COLORS.textMuted,
        background: active ? COLORS.accent : "transparent",
        borderRight: `1px solid ${COLORS.border}`,
        userSelect: "none",
        whiteSpace: "nowrap"
      }
    }, opt.label);
  }));
}

// ================= mini SVG line chart (no external chart lib needed) =================
function MiniLineChart({
  data,
  formatY,
  height = 240
}) {
  if (!data || data.length < 2) return null;
  const W = 640,
    H = height;
  const pad = {
    top: 14,
    right: 18,
    bottom: 32,
    left: 50
  };
  const values = data.map(d => d.value);
  let min = Math.min(...values),
    max = Math.max(...values);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const cushion = (max - min) * 0.12;
  min -= cushion;
  max += cushion;
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const x = i => pad.left + (data.length === 1 ? innerW / 2 : i * innerW / (data.length - 1));
  const y = v => pad.top + innerH - (v - min) / (max - min) * innerH;
  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(" ");
  const gridN = 4;
  const gridValues = Array.from({
    length: gridN + 1
  }, (_, i) => min + (max - min) * i / gridN);
  const labelStep = data.length > 7 ? Math.ceil(data.length / 7) : 1;
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    style: {
      width: "100%",
      height: "100%"
    }
  }, gridValues.map((gv, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: pad.left,
    x2: W - pad.right,
    y1: y(gv),
    y2: y(gv),
    stroke: COLORS.borderSoft,
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("text", {
    x: pad.left - 8,
    y: y(gv) + 4,
    textAnchor: "end",
    fontSize: "10",
    fill: COLORS.textFaint,
    fontFamily: bodyFont
  }, formatY(gv)))), data.map((d, i) => i % labelStep === 0 ? /*#__PURE__*/React.createElement("text", {
    key: i,
    x: x(i),
    y: H - pad.bottom + 18,
    textAnchor: "middle",
    fontSize: "10",
    fill: COLORS.textFaint,
    fontFamily: bodyFont
  }, d.label) : null), /*#__PURE__*/React.createElement("path", {
    d: pathD,
    fill: "none",
    stroke: COLORS.accent,
    strokeWidth: "2.5"
  }), data.map((d, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: x(i),
    cy: y(d.value),
    r: d.isPR ? 6 : 3.5,
    fill: d.isPR ? COLORS.white : COLORS.accent,
    stroke: COLORS.accent,
    strokeWidth: d.isPR ? 2 : 1
  }, /*#__PURE__*/React.createElement("title", null, `${d.label}: ${formatY(d.value)}`))));
}

// ================= exercise combobox (library-aware) =================
function ExerciseCombobox({
  value,
  onChange,
  onPick,
  library,
  onAddToLibrary
}) {
  const [open, setOpen] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newGroups, setNewGroups] = useState([]);
  const ref = useRef(null);
  useEffect(() => {
    const onDocClick = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setAddingNew(false);
        setNewGroups([]);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
  const q = value.trim().toLowerCase();
  const grouped = useMemo(() => {
    return MUSCLE_GROUPS.map(g => ({
      group: g,
      items: library.filter(ex => ex.groups.includes(g.id) && (!q || ex.name.toLowerCase().includes(q)))
    })).filter(g => g.items.length > 0);
  }, [library, q]);
  const exactMatch = useMemo(() => library.some(ex => ex.name.trim().toLowerCase() === q), [library, q]);
  const canOfferAdd = !!q && !exactMatch && onAddToLibrary;
  const toggleNewGroup = id => setNewGroups(gr => gr.includes(id) ? gr.filter(x => x !== id) : [...gr, id]);
  const confirmAdd = () => {
    if (newGroups.length === 0) return;
    onAddToLibrary(value.trim(), newGroups);
    setAddingNew(false);
    setNewGroups([]);
    setOpen(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Oefening (typ of kies uit bibliotheek)",
    value: value,
    onChange: e => {
      onChange(e.target.value);
      setOpen(true);
      setAddingNew(false);
    },
    onFocus: () => setOpen(true)
  }), open && (grouped.length > 0 || canOfferAdd) && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      zIndex: 30,
      background: COLORS.surfaceRaised,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      maxHeight: 320,
      overflowY: "auto",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
    }
  }, grouped.map(({
    group,
    items
  }) => /*#__PURE__*/React.createElement("div", {
    key: group.id
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      color: COLORS.accent,
      padding: "8px 10px 4px"
    }
  }, group.label), items.map(ex => /*#__PURE__*/React.createElement("div", {
    key: group.id + ex.id,
    onMouseDown: e => {
      e.preventDefault();
      onChange(ex.name);
      onPick && onPick(ex);
      setOpen(false);
    },
    style: {
      padding: "7px 12px",
      fontSize: 13,
      color: COLORS.text,
      cursor: "pointer"
    },
    onMouseEnter: e => e.currentTarget.style.background = COLORS.bg,
    onMouseLeave: e => e.currentTarget.style.background = "transparent"
  }, ex.name)))), canOfferAdd && /*#__PURE__*/React.createElement("div", {
    onMouseDown: e => e.preventDefault(),
    style: {
      borderTop: grouped.length > 0 ? `1px solid ${COLORS.borderSoft}` : "none",
      padding: 10
    }
  }, !addingNew ? /*#__PURE__*/React.createElement("div", {
    onClick: () => setAddingNew(true),
    style: {
      color: COLORS.accent,
      fontSize: 12.5,
      fontWeight: 700,
      cursor: "pointer",
      padding: "2px 2px"
    }
  }, "+ \"", value.trim(), "\" toevoegen aan bibliotheek") : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: COLORS.textFaint,
      marginBottom: 6
    }
  }, "Spiergroep(en) voor \"", value.trim(), "\":"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 8
    }
  }, MUSCLE_GROUPS.map(g => {
    const active = newGroups.includes(g.id);
    return /*#__PURE__*/React.createElement("div", {
      key: g.id,
      onClick: () => toggleNewGroup(g.id),
      title: g.label,
      style: {
        fontSize: 11,
        fontWeight: 700,
        padding: "5px 9px",
        borderRadius: 5,
        cursor: "pointer",
        border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
        background: active ? COLORS.accentSoft : "transparent",
        color: active ? COLORS.accent : COLORS.textMuted
      }
    }, g.short);
  })), /*#__PURE__*/React.createElement(Btn, {
    onClick: confirmAdd,
    disabled: newGroups.length === 0,
    style: {
      width: "100%",
      padding: "7px 10px",
      fontSize: 12
    }
  }, "Toevoegen aan bibliotheek")))));
}

// ================= library modal =================
function LibraryModal({
  library,
  libState,
  setLibState,
  onClose
}) {
  const [newName, setNewName] = useState("");
  const [newGroups, setNewGroups] = useState([]);
  const [search, setSearch] = useState("");
  const byGroup = groupId => library.filter(ex => ex.groups.includes(groupId)).slice().sort((a, b) => {
    const order = libState.order[groupId] || [];
    const ia = order.indexOf(a.id);
    const ib = order.indexOf(b.id);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  const q = search.trim().toLowerCase();
  const visibleInGroup = groupId => {
    const all = byGroup(groupId);
    return q ? all.filter(ex => ex.name.toLowerCase().includes(q)) : all;
  };
  const move = (groupId, id, dir) => {
    const list = byGroup(groupId).map(e => e.id);
    const i = list.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const nextState = {
      ...libState,
      order: {
        ...libState.order,
        [groupId]: list
      }
    };
    setLibState(nextState);
    saveLibraryState(nextState);
  };
  const removeExercise = id => {
    const isCustom = libState.customExercises.some(e => e.id === id);
    const nextState = isCustom ? {
      ...libState,
      customExercises: libState.customExercises.filter(e => e.id !== id)
    } : {
      ...libState,
      hiddenIds: [...libState.hiddenIds, id]
    };
    setLibState(nextState);
    saveLibraryState(nextState);
  };
  const addExercise = () => {
    const name = newName.trim();
    if (!name || newGroups.length === 0) return;
    const entry = {
      id: uid(),
      name,
      groups: newGroups
    };
    const nextState = {
      ...libState,
      customExercises: [...libState.customExercises, entry]
    };
    setLibState(nextState);
    saveLibraryState(nextState);
    setNewName("");
    setNewGroups([]);
  };
  const toggleGroup = id => setNewGroups(g => g.includes(id) ? g.filter(x => x !== id) : [...g, id]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    },
    onMouseDown: e => e.target === e.currentTarget && onClose()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: COLORS.bg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      width: "100%",
      maxWidth: 640,
      maxHeight: "85vh",
      overflowY: "auto",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    sub: "Beheer je oefeningen per spiergroep — sleep met pijltjes om te ordenen"
  }, "Oefeningenbibliotheek"), /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: onClose
  }, "Sluiten")), /*#__PURE__*/React.createElement(Input, {
    placeholder: "Zoek een oefening...",
    value: search,
    onChange: e => setSearch(e.target.value),
    style: {
      marginBottom: 18
    }
  }), MUSCLE_GROUPS.map(g => {
    const items = visibleInGroup(g.id);
    if (q && items.length === 0) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: g.id,
      style: {
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: COLORS.accent,
        marginBottom: 8,
        borderBottom: `1px solid ${COLORS.borderSoft}`,
        paddingBottom: 6
      }
    }, g.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 4
      }
    }, items.map(ex => /*#__PURE__*/React.createElement("div", {
      key: ex.id,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 10px",
        background: COLORS.surface,
        border: `1px solid ${COLORS.borderSoft}`,
        borderRadius: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: COLORS.text
      }
    }, ex.name), ex.groups.length > 1 && ex.groups.filter(x => x !== g.id).map(x => /*#__PURE__*/React.createElement("span", {
      key: x,
      style: {
        fontSize: 9.5,
        color: COLORS.textFaint,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 4,
        padding: "1px 5px"
      }
    }, groupShort(x)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      onClick: () => move(g.id, ex.id, -1),
      style: {
        cursor: "pointer",
        color: COLORS.textFaint,
        padding: "0 4px"
      }
    }, "▲"), /*#__PURE__*/React.createElement("span", {
      onClick: () => move(g.id, ex.id, 1),
      style: {
        cursor: "pointer",
        color: COLORS.textFaint,
        padding: "0 4px"
      }
    }, "▼"), /*#__PURE__*/React.createElement("span", {
      onClick: () => removeExercise(ex.id),
      style: {
        cursor: "pointer",
        color: COLORS.accent,
        fontSize: 11.5,
        marginLeft: 6
      }
    }, "verwijder")))), items.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: COLORS.textFaint,
        padding: "4px 2px"
      }
    }, "Geen oefeningen in deze groep.")));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: 14,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Label, null, "Nieuwe oefening toevoegen"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Naam oefening",
    value: newName,
    onChange: e => setNewName(e.target.value)
  }), /*#__PURE__*/React.createElement(Btn, {
    onClick: addExercise,
    style: {
      flexShrink: 0
    }
  }, "Toevoegen")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, MUSCLE_GROUPS.map(g => {
    const active = newGroups.includes(g.id);
    return /*#__PURE__*/React.createElement("div", {
      key: g.id,
      onClick: () => toggleGroup(g.id),
      style: {
        fontSize: 11.5,
        fontWeight: 600,
        padding: "6px 10px",
        borderRadius: 5,
        cursor: "pointer",
        border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
        background: active ? COLORS.accentSoft : "transparent",
        color: active ? COLORS.accent : COLORS.textMuted
      }
    }, g.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: COLORS.textFaint,
      marginTop: 6
    }
  }, "Kies één of meerdere spiergroepen die deze oefening aanspreekt."))));
}

// ================= main app =================
function TrainingTracker() {
  const [clients, setClients] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState({
    sessions: [],
    measurements: []
  });
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [tab, setTab] = useState("training");
  const [newClientName, setNewClientName] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [libState, setLibState] = useState({
    hiddenIds: [],
    customExercises: [],
    order: {}
  });
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const importInputRef = useRef(null);
  useEffect(() => {
    (async () => {
      const list = await loadClientsList();
      setClients(list);
      setLoadingClients(false);
      if (list.length) setSelectedId(list[0].id);
      const lib = await loadLibraryState();
      setLibState(lib);
    })();
  }, []);
  useEffect(() => {
    if (!selectedId) return;
    setLoadingData(true);
    (async () => {
      const d = await loadClientData(selectedId);
      setData({
        sessions: d.sessions || [],
        measurements: d.measurements || []
      });
      setLoadingData(false);
    })();
  }, [selectedId]);
  const persist = useCallback(next => {
    setData(next);
    if (selectedId) saveClientData(selectedId, next);
  }, [selectedId]);
  const library = useMemo(() => {
    const builtins = DEFAULT_LIBRARY.filter(ex => !libState.hiddenIds.includes(ex.id));
    return [...builtins, ...libState.customExercises];
  }, [libState]);
  const addClient = async () => {
    const name = newClientName.trim();
    if (!name) return;
    const client = {
      id: uid(),
      name
    };
    const list = [...clients, client];
    setClients(list);
    setNewClientName("");
    await saveClientsList(list);
    setSelectedId(client.id);
  };
  const deleteClient = async id => {
    const list = clients.filter(c => c.id !== id);
    setClients(list);
    await saveClientsList(list);
    try {
      await window.storage.delete(`client-data:${id}`, false);
    } catch {}
    setConfirmDelete(null);
    if (selectedId === id) {
      setSelectedId(list.length ? list[0].id : null);
      setData({
        sessions: [],
        measurements: []
      });
    }
  };
  const selectedClient = clients.find(c => c.id === selectedId);
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.trim().toLowerCase()));
  const addLibraryExercise = (name, groups) => {
    const entry = {
      id: uid(),
      name,
      groups
    };
    const nextState = {
      ...libState,
      customExercises: [...libState.customExercises, entry]
    };
    setLibState(nextState);
    saveLibraryState(nextState);
    return entry;
  };
  const exportAll = async () => {
    const clientData = {};
    for (const c of clients) clientData[c.id] = await loadClientData(c.id);
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      clients,
      library: libState,
      clientData
    };
    downloadFile(`aot-tool-backup-${todayISO()}.json`, JSON.stringify(payload, null, 2), "application/json");
  };
  const applyImportedPayload = async payload => {
    if (!payload || !payload.clients) throw new Error("ongeldig bestand");
    const ok = window.confirm("Dit overschrijft de data die nu hier zichtbaar is. Doorgaan?");
    if (!ok) return;
    await saveClientsList(payload.clients);
    await saveLibraryState(payload.library || {
      hiddenIds: [],
      customExercises: [],
      order: {}
    });
    for (const c of payload.clients) {
      await saveClientData(c.id, payload.clientData && payload.clientData[c.id] || {
        sessions: [],
        measurements: []
      });
    }
    setClients(payload.clients);
    setLibState(payload.library || {
      hiddenIds: [],
      customExercises: [],
      order: {}
    });
    setImportMsg("Geïmporteerd ✓");
    if (payload.clients.length) setSelectedId(payload.clients[0].id);
    setTimeout(() => setImportMsg(""), 3000);
  };
  const handleImportFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await applyImportedPayload(JSON.parse(reader.result));
      } catch (err) {
        window.alert("Kon het bestand niet importeren. Is het een geldige back-up?");
      }
    };
    reader.readAsText(file);
  };
  const handleImportPaste = async () => {
    try {
      await applyImportedPayload(JSON.parse(importText));
      setImportText("");
      setImportOpen(false);
    } catch (err) {
      window.alert("Kon de geplakte tekst niet importeren. Is het de volledige inhoud van een back-up-bestand?");
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100%",
      minHeight: 640,
      background: COLORS.bg,
      fontFamily: bodyFont
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 220,
      flexShrink: 0,
      borderRight: `1px solid ${COLORS.borderSoft}`,
      display: "flex",
      flexDirection: "column",
      padding: "18px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: COLORS.white,
      borderRadius: 8,
      padding: "10px 12px",
      marginBottom: 10,
      display: "inline-block"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "logo.png",
    alt: "Art of Training",
    style: {
      width: "100%",
      maxWidth: 150,
      display: "block"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: COLORS.textFaint,
      marginBottom: 10
    }
  }, "Klanten & progressie"), clients.length > 3 && /*#__PURE__*/React.createElement(Input, {
    placeholder: "Zoek klant...",
    value: clientSearch,
    onChange: e => setClientSearch(e.target.value),
    style: {
      marginBottom: 10,
      fontSize: 12.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, loadingClients && /*#__PURE__*/React.createElement("div", {
    style: {
      color: COLORS.textFaint,
      fontSize: 12
    }
  }, "Laden…"), !loadingClients && clients.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      color: COLORS.textFaint,
      fontSize: 12,
      lineHeight: 1.5
    }
  }, "Nog geen klanten. Voeg er hieronder een toe."), !loadingClients && clients.length > 0 && filteredClients.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      color: COLORS.textFaint,
      fontSize: 12
    }
  }, "Geen klant gevonden voor \"", clientSearch, "\"."), filteredClients.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    onClick: () => setSelectedId(c.id),
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "9px 10px",
      borderRadius: 6,
      cursor: "pointer",
      background: c.id === selectedId ? COLORS.surfaceRaised : "transparent",
      borderLeft: `3px solid ${c.id === selectedId ? COLORS.accent : "transparent"}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: c.id === selectedId ? COLORS.text : COLORS.textMuted,
      fontWeight: c.id === selectedId ? 700 : 400,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, c.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Naam klant",
    value: newClientName,
    onChange: e => setNewClientName(e.target.value),
    onKeyDown: e => e.key === "Enter" && addClient()
  }), /*#__PURE__*/React.createElement(Btn, {
    onClick: addClient,
    style: {
      width: "100%"
    }
  }, "+ Klant toevoegen"), /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => setLibraryOpen(true),
    style: {
      width: "100%"
    }
  }, "Oefeningenbibliotheek"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: COLORS.borderSoft,
      margin: "8px 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: COLORS.textFaint,
      lineHeight: 1.5,
      marginBottom: 2
    }
  }, "Werk je op meerdere toestellen? Exporteer hier en importeer op je ander toestel."), /*#__PURE__*/React.createElement(Btn, {
    variant: "subtle",
    onClick: exportAll,
    style: {
      width: "100%"
    }
  }, "Exporteer back-up"), /*#__PURE__*/React.createElement(Btn, {
    variant: "subtle",
    onClick: () => setImportOpen(v => !v),
    style: {
      width: "100%"
    }
  }, importOpen ? "Sluit importeren" : "Importeer back-up"), importOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      background: COLORS.surfaceRaised,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 6,
      padding: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: COLORS.textFaint,
      marginBottom: 6
    }
  }, "Kies het bestand:"), /*#__PURE__*/React.createElement("input", {
    ref: importInputRef,
    type: "file",
    accept: "application/json",
    onChange: handleImportFile,
    style: {
      fontSize: 10,
      color: COLORS.textMuted,
      width: "100%",
      marginBottom: 8
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: COLORS.textFaint,
      margin: "6px 0"
    }
  }, "Werkt de bestandskiezer niet? Open het back-up-bestand in een teksteditor, kopieer alles, en plak hier:"), /*#__PURE__*/React.createElement("textarea", {
    value: importText,
    onChange: e => setImportText(e.target.value),
    placeholder: "Plak hier de volledige inhoud van je back-up-bestand...",
    style: {
      width: "100%",
      minHeight: 70,
      fontFamily: monoFont,
      fontSize: 10,
      background: COLORS.bg,
      color: COLORS.text,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 5,
      padding: 6,
      boxSizing: "border-box",
      resize: "vertical"
    }
  }), /*#__PURE__*/React.createElement(Btn, {
    onClick: handleImportPaste,
    disabled: !importText.trim(),
    style: {
      width: "100%",
      marginTop: 6
    }
  }, "Importeer geplakte tekst")), importMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: COLORS.accent
    }
  }, importMsg))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "24px 32px"
    }
  }, !selectedClient ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: COLORS.textMuted,
      fontSize: 14,
      marginTop: 40
    }
  }, "Selecteer of voeg een klant toe om te starten.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: COLORS.textFaint,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: 2
    }
  }, "Klant"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: displayFont,
      fontWeight: 800,
      fontSize: 30,
      textTransform: "uppercase",
      letterSpacing: "0.01em",
      color: COLORS.text,
      margin: 0
    }
  }, selectedClient.name)), confirmDelete === selectedClient.id ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "danger",
    onClick: () => deleteClient(selectedClient.id)
  }, "Bevestig verwijderen"), /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => setConfirmDelete(null)
  }, "Annuleer")) : /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => setConfirmDelete(selectedClient.id)
  }, "Klant verwijderen")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      borderBottom: `1px solid ${COLORS.borderSoft}`,
      marginBottom: 24
    }
  }, [["training", "Training plannen"], ["progressie", "Progressie"], ["metingen", "Lichaamsmetingen"]].map(([key, label]) => /*#__PURE__*/React.createElement("div", {
    key: key,
    onClick: () => setTab(key),
    style: {
      padding: "8px 14px",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      color: tab === key ? COLORS.text : COLORS.textFaint,
      borderBottom: tab === key ? `2px solid ${COLORS.accent}` : "2px solid transparent",
      marginBottom: -1
    }
  }, label))), loadingData ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: COLORS.textFaint,
      fontSize: 13
    }
  }, "Data laden…") : /*#__PURE__*/React.createElement(React.Fragment, null, tab === "training" && /*#__PURE__*/React.createElement(TrainingTab, {
    data: data,
    persist: persist,
    library: library,
    clientName: selectedClient.name,
    clientId: selectedClient.id,
    clients: clients,
    onAddToLibrary: addLibraryExercise
  }), tab === "progressie" && /*#__PURE__*/React.createElement(ProgressieTab, {
    data: data
  }), tab === "metingen" && /*#__PURE__*/React.createElement(MetingenTab, {
    data: data,
    persist: persist
  })))), libraryOpen && /*#__PURE__*/React.createElement(LibraryModal, {
    library: library,
    libState: libState,
    setLibState: setLibState,
    onClose: () => setLibraryOpen(false)
  }));
}

// ================= helpers for session/blocks =================
function emptySet(mode) {
  return mode === "time" ? {
    id: uid(),
    duration: "",
    weight: "",
    durationB: "",
    weightB: ""
  } : {
    id: uid(),
    reps: "",
    weight: "",
    repsB: "",
    weightB: ""
  };
}
function emptyExercise() {
  return {
    id: uid(),
    name: "",
    mode: "reps",
    sets: [emptySet("reps")],
    notes: "",
    durationUnit: "sec",
    sharedWith: "both"
  };
}
function emptyBlock(type = "single", exerciseCount = 1) {
  return {
    id: uid(),
    type,
    exercises: Array.from({
      length: exerciseCount
    }, () => emptyExercise())
  };
}

// find most recent logged instance of an exercise name for this client
function findLastUsage(sessions, name) {
  const target = name.trim().toLowerCase();
  if (!target) return null;
  const sorted = [...sessions].sort((a, b) => a.date < b.date ? 1 : -1);
  for (const s of sorted) {
    for (const block of s.blocks || []) {
      for (const ex of block.exercises) {
        if (ex.name.trim().toLowerCase() === target && ex.sets.length > 0) {
          return {
            mode: ex.mode,
            lastSet: ex.sets[ex.sets.length - 1]
          };
        }
      }
    }
  }
  return null;
}
function blockBadgeLabel(type) {
  return BLOCK_TYPES.find(b => b.id === type)?.label || "Los";
}

// ================= Training tab =================
function TrainingTab({
  data,
  persist,
  library,
  clientName,
  clientId,
  clients,
  onAddToLibrary
}) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [form, setForm] = useState({
    date: todayISO(),
    notes: "",
    blocks: [emptyBlock("single", 1)],
    partnerId: ""
  });
  const resetForm = () => setForm({
    date: todayISO(),
    notes: "",
    blocks: [emptyBlock("single", 1)],
    partnerId: ""
  });
  const partnerOptions = (clients || []).filter(c => c.id !== clientId);
  const partner = partnerOptions.find(c => c.id === form.partnerId) || null;
  const addBlock = (type, count) => setForm(f => ({
    ...f,
    blocks: [...f.blocks, emptyBlock(type, count)]
  }));
  const removeBlock = blockId => setForm(f => ({
    ...f,
    blocks: f.blocks.filter(b => b.id !== blockId)
  }));
  const setBlockType = (blockId, type) => setForm(f => ({
    ...f,
    blocks: f.blocks.map(b => b.id === blockId ? {
      ...b,
      type
    } : b)
  }));
  const addExerciseToBlock = blockId => setForm(f => ({
    ...f,
    blocks: f.blocks.map(b => b.id === blockId ? {
      ...b,
      exercises: [...b.exercises, emptyExercise()]
    } : b)
  }));
  const removeExerciseFromBlock = (blockId, exId) => setForm(f => ({
    ...f,
    blocks: f.blocks.map(b => b.id === blockId ? {
      ...b,
      exercises: b.exercises.filter(e => e.id !== exId)
    } : b).filter(b => b.exercises.length > 0)
  }));
  const applyAutofill = (blockId, exId, name) => {
    const usage = findLastUsage(data.sessions, name);
    if (!usage) return;
    setForm(f => ({
      ...f,
      blocks: f.blocks.map(b => b.id === blockId ? {
        ...b,
        exercises: b.exercises.map(ex => {
          if (ex.id !== exId) return ex;
          const firstSet = usage.mode === "time" ? {
            ...ex.sets[0],
            duration: usage.lastSet.duration || "",
            weight: usage.lastSet.weight || ""
          } : {
            ...ex.sets[0],
            reps: usage.lastSet.reps || "",
            weight: usage.lastSet.weight || ""
          };
          return {
            ...ex,
            mode: usage.mode,
            sets: [firstSet, ...ex.sets.slice(1)]
          };
        })
      } : b)
    }));
  };
  const updateExerciseName = (blockId, exId, name) => {
    setForm(f => ({
      ...f,
      blocks: f.blocks.map(b => b.id === blockId ? {
        ...b,
        exercises: b.exercises.map(ex => ex.id === exId ? {
          ...ex,
          name
        } : ex)
      } : b)
    }));
  };
  const updateExerciseNotes = (blockId, exId, notes) => {
    setForm(f => ({
      ...f,
      blocks: f.blocks.map(b => b.id === blockId ? {
        ...b,
        exercises: b.exercises.map(ex => ex.id === exId ? {
          ...ex,
          notes
        } : ex)
      } : b)
    }));
  };
  const setExerciseMode = (blockId, exId, mode) => setForm(f => ({
    ...f,
    blocks: f.blocks.map(b => b.id === blockId ? {
      ...b,
      exercises: b.exercises.map(ex => ex.id === exId ? {
        ...ex,
        mode,
        sets: [emptySet(mode)]
      } : ex)
    } : b)
  }));
  const setExerciseDurationUnit = (blockId, exId, durationUnit) => setForm(f => ({
    ...f,
    blocks: f.blocks.map(b => b.id === blockId ? {
      ...b,
      exercises: b.exercises.map(ex => ex.id === exId ? {
        ...ex,
        durationUnit
      } : ex)
    } : b)
  }));
  const setExerciseSharedWith = (blockId, exId, sharedWith) => setForm(f => ({
    ...f,
    blocks: f.blocks.map(b => b.id === blockId ? {
      ...b,
      exercises: b.exercises.map(ex => ex.id === exId ? {
        ...ex,
        sharedWith
      } : ex)
    } : b)
  }));
  const addSet = (blockId, exId) => setForm(f => ({
    ...f,
    blocks: f.blocks.map(b => b.id === blockId ? {
      ...b,
      exercises: b.exercises.map(ex => {
        if (ex.id !== exId) return ex;
        const last = ex.sets[ex.sets.length - 1];
        const carried = last ? {
          ...last,
          id: uid()
        } : emptySet(ex.mode);
        return {
          ...ex,
          sets: [...ex.sets, carried]
        };
      })
    } : b)
  }));
  const removeSet = (blockId, exId, setId) => setForm(f => ({
    ...f,
    blocks: f.blocks.map(b => b.id === blockId ? {
      ...b,
      exercises: b.exercises.map(ex => ex.id === exId ? {
        ...ex,
        sets: ex.sets.filter(s => s.id !== setId)
      } : ex)
    } : b)
  }));
  const updateSet = (blockId, exId, setId, field, value) => setForm(f => ({
    ...f,
    blocks: f.blocks.map(b => b.id === blockId ? {
      ...b,
      exercises: b.exercises.map(ex => ex.id === exId ? {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? {
          ...s,
          [field]: value
        } : s)
      } : ex)
    } : b)
  }));
  const buildBlocksForPerspective = perspective => form.blocks.map(b => ({
    ...b,
    exercises: b.exercises.filter(ex => {
      const shared = ex.sharedWith || "both";
      if (perspective === "primary") return shared !== "onlyPartner";
      return shared !== "onlyPrimary";
    }).filter(ex => ex.name.trim()).map(ex => {
      const shared = ex.sharedWith || "both";
      const usePartnerFields = perspective === "partner" && shared === "both";
      const sets = ex.sets.map(s => ex.mode === "time" ? {
        id: uid(),
        duration: (usePartnerFields ? s.durationB : s.duration) || "",
        weight: (usePartnerFields ? s.weightB : s.weight) || ""
      } : {
        id: uid(),
        reps: (usePartnerFields ? s.repsB : s.reps) || "",
        weight: (usePartnerFields ? s.weightB : s.weight) || ""
      }).filter(s => s.reps !== "" || s.weight !== "" || s.duration !== "");
      return {
        id: uid(),
        name: ex.name,
        mode: ex.mode,
        durationUnit: ex.durationUnit || "sec",
        notes: (ex.notes || "").trim(),
        sets
      };
    }).filter(ex => ex.sets.length > 0)
  })).filter(b => b.exercises.length > 0);
  const saveSession = async () => {
    const originalSession = editingSessionId ? data.sessions.find(s => s.id === editingSessionId) : null;
    if (partner) {
      const primaryBlocks = buildBlocksForPerspective("primary");
      const partnerBlocks = buildBlocksForPerspective("partner");
      if (primaryBlocks.length === 0 && partnerBlocks.length === 0) return;
      const primarySession = {
        id: editingSessionId || uid(),
        date: form.date,
        notes: form.notes.trim(),
        blocks: primaryBlocks,
        duoWith: partner.name
      };
      const sessions = editingSessionId ? data.sessions.map(s => s.id === editingSessionId ? primarySession : s) : [primarySession, ...data.sessions].sort((a, b) => a.date < b.date ? 1 : -1);
      persist({
        ...data,
        sessions
      });

      // only create the partner's own copy for brand-new duo sessions —
      // editing an existing session only touches the client you're currently viewing.
      if (!editingSessionId && partnerBlocks.length > 0) {
        const partnerSession = {
          id: uid(),
          date: form.date,
          notes: form.notes.trim(),
          blocks: partnerBlocks,
          duoWith: clientName
        };
        const partnerData = await loadClientData(partner.id);
        const partnerSessions = [partnerSession, ...partnerData.sessions].sort((a, b) => a.date < b.date ? 1 : -1);
        await saveClientData(partner.id, {
          ...partnerData,
          sessions: partnerSessions
        });
      }
    } else {
      const cleanBlocks = buildBlocksForPerspective("primary");
      if (cleanBlocks.length === 0) return;
      const session = {
        id: editingSessionId || uid(),
        date: form.date,
        notes: form.notes.trim(),
        blocks: cleanBlocks,
        ...(originalSession && originalSession.duoWith ? {
          duoWith: originalSession.duoWith
        } : {})
      };
      const sessions = editingSessionId ? data.sessions.map(s => s.id === editingSessionId ? session : s) : [session, ...data.sessions].sort((a, b) => a.date < b.date ? 1 : -1);
      persist({
        ...data,
        sessions
      });
    }
    resetForm();
    setShowForm(false);
    setEditingSessionId(null);
  };
  const editSession = s => {
    setForm({
      date: s.date,
      notes: s.notes || "",
      partnerId: "",
      blocks: (s.blocks || []).map(b => ({
        id: uid(),
        type: b.type,
        exercises: b.exercises.map(ex => ({
          id: uid(),
          name: ex.name,
          mode: ex.mode || "reps",
          durationUnit: ex.durationUnit || "sec",
          notes: ex.notes || "",
          sharedWith: "both",
          sets: (ex.sets || []).map(st => ({
            id: uid(),
            reps: st.reps || "",
            weight: st.weight || "",
            duration: st.duration || "",
            repsB: "",
            weightB: "",
            durationB: ""
          }))
        }))
      }))
    });
    setEditingSessionId(s.id);
    setShowForm(true);
    setExpandedId(null);
  };
  const deleteSession = id => persist({
    ...data,
    sessions: data.sessions.filter(s => s.id !== id)
  });
  const sessionToText = s => {
    const lines = [`TRAINING · ${clientName} · ${fmtDate(s.date)}`, ""];
    s.blocks.forEach((b, i) => {
      if (b.type !== "single") lines.push(`${blockBadgeLabel(b.type).toUpperCase()}`);
      b.exercises.forEach(ex => {
        lines.push(`${ex.name}`);
        ex.sets.forEach((set, si) => {
          if (ex.mode === "time") {
            lines.push(`  set ${si + 1}: ${fmtDuration(set.duration)}${set.weight ? ` @ ${set.weight}kg` : ""}`);
          } else {
            lines.push(`  set ${si + 1}: ${set.reps} reps${set.weight ? ` @ ${set.weight}kg` : ""}`);
          }
        });
        if (ex.notes) lines.push(`  (${ex.notes})`);
      });
      lines.push("");
    });
    if (s.notes) lines.push(`Notities: ${s.notes}`, "");
    lines.push("— Art of Training");
    return lines.join("\n");
  };
  const handleCopy = s => {
    copyToClipboard(sessionToText(s)).then(() => {
      setCopiedId(s.id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };
  const handleDownload = s => {
    const rowsHtml = s.blocks.map(b => {
      const badge = b.type !== "single" ? `<div style="display:inline-block;background:#CF5550;color:#fff;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:3px 9px;border-radius:4px;margin-bottom:8px;">${blockBadgeLabel(b.type)}</div>` : "";
      const exercisesHtml = b.exercises.map(ex => {
        const setsHtml = ex.sets.map((set, si) => ex.mode === "time" ? `<span style="display:inline-block;background:#1B1917;border:1px solid #37332E;border-radius:4px;padding:3px 8px;margin:2px;font-family:monospace;font-size:12px;color:#ddd;">${fmtDuration(set.duration)}${set.weight ? ` · ${set.weight}kg` : ""}</span>` : `<span style="display:inline-block;background:#1B1917;border:1px solid #37332E;border-radius:4px;padding:3px 8px;margin:2px;font-family:monospace;font-size:12px;color:#ddd;">${set.reps}×${set.weight || 0}kg</span>`).join("");
        return `<div style="margin-bottom:10px;"><div style="font-weight:700;color:#fff;margin-bottom:4px;">${ex.name}</div><div>${setsHtml}</div>${ex.notes ? `<div style="font-size:12px;color:#A69E92;font-style:italic;margin-top:4px;">${ex.notes}</div>` : ""}</div>`;
      }).join("");
      return `<div style="border:1px solid #37332E;border-radius:8px;padding:14px;margin-bottom:12px;">${badge}${exercisesHtml}</div>`;
    }).join("");
    const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="utf-8"><title>Training ${fmtDate(s.date)} — ${clientName}</title></head>
<body style="margin:0;background:#121110;color:#F7F4EE;font-family:-apple-system,Segoe UI,sans-serif;padding:32px;">
<div style="max-width:640px;margin:0 auto;">
  <div style="font-weight:800;text-transform:uppercase;letter-spacing:.06em;font-size:20px;">Art <span style="color:#CF5550;">of</span> Training</div>
  <div style="width:32px;height:3px;background:#CF5550;margin:8px 0 20px;"></div>
  <div style="font-size:12px;color:#A69E92;text-transform:uppercase;letter-spacing:.05em;">Training voor</div>
  <div style="font-size:26px;font-weight:800;text-transform:uppercase;margin-bottom:2px;">${clientName}</div>
  <div style="font-size:13px;color:#A69E92;margin-bottom:20px;">${fmtDate(s.date)}</div>
  ${rowsHtml}
  ${s.notes ? `<div style="margin-top:8px;font-size:13px;color:#A69E92;font-style:italic;">${s.notes}</div>` : ""}
  <div style="margin-top:28px;font-size:12px;color:#6C645A;">Art of Training · Krijzeltand 4a · Sint-Denijs-Westrem</div>
</div>
</body></html>`;
    downloadFile(`AOT-${clientName.replace(/\s+/g, "-")}-${s.date}.html`, html, "text/html");
  };
  const sorted = [...data.sessions].sort((a, b) => a.date < b.date ? 1 : -1);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    sub: `${sorted.length} sessie${sorted.length === 1 ? "" : "s"} gelogd`
  }, "Trainingssessies"), !showForm && /*#__PURE__*/React.createElement(Btn, {
    onClick: () => setShowForm(true)
  }, "+ Nieuwe sessie")), showForm && /*#__PURE__*/React.createElement("div", {
    style: {
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      padding: 18,
      marginBottom: 22
    }
  }, editingSessionId && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: COLORS.accent,
      fontWeight: 700,
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: "0.04em"
    }
  }, "Sessie bewerken"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      marginBottom: 14,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 180
    }
  }, /*#__PURE__*/React.createElement(Label, null, "Datum"), /*#__PURE__*/React.createElement(Input, {
    type: "date",
    value: form.date,
    onChange: e => setForm(f => ({
      ...f,
      date: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement(Label, null, "Notities (optioneel)"), /*#__PURE__*/React.createElement(Input, {
    placeholder: "bv. focus op techniek, RPE hoog vandaag...",
    value: form.notes,
    onChange: e => setForm(f => ({
      ...f,
      notes: e.target.value
    }))
  })), !editingSessionId && partnerOptions.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 190
    }
  }, /*#__PURE__*/React.createElement(Label, null, "Duo met (optioneel)"), /*#__PURE__*/React.createElement("select", {
    value: form.partnerId,
    onChange: e => setForm(f => ({
      ...f,
      partnerId: e.target.value
    })),
    style: {
      fontFamily: bodyFont,
      fontSize: 13,
      background: COLORS.bg,
      color: COLORS.text,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 5,
      padding: "8px 10px",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Geen — solo sessie"), partnerOptions.map(c => /*#__PURE__*/React.createElement("option", {
    key: c.id,
    value: c.id
  }, c.name))))), partner && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: COLORS.textMuted,
      marginBottom: 14,
      background: COLORS.bg,
      border: `1px solid ${COLORS.borderSoft}`,
      borderRadius: 6,
      padding: "8px 10px"
    }
  }, "Duo-sessie tussen ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, clientName), " en ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, partner.name), ". Per oefening kan je aanduiden of ze samen dezelfde oefening doen (met eigen gewicht/reps) of dat een oefening enkel voor één van beiden is. Deze sessie wordt automatisch ook bij ", partner.name, " gelogd."), form.blocks.map((block, bIdx) => /*#__PURE__*/React.createElement("div", {
    key: block.id,
    style: {
      border: `1px solid ${block.type !== "single" ? COLORS.accent + "66" : COLORS.borderSoft}`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      background: COLORS.bg
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Segmented, {
    options: BLOCK_TYPES,
    value: block.type,
    onChange: t => setBlockType(block.id, t)
  }), form.blocks.length > 1 && /*#__PURE__*/React.createElement("span", {
    onClick: () => removeBlock(block.id),
    style: {
      color: COLORS.accent,
      fontSize: 11.5,
      cursor: "pointer"
    }
  }, "groep verwijderen")), block.exercises.map((ex, exIdx) => /*#__PURE__*/React.createElement("div", {
    key: ex.id,
    style: {
      background: COLORS.surface,
      border: `1px solid ${COLORS.borderSoft}`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(ExerciseCombobox, {
    value: ex.name,
    onChange: name => updateExerciseName(block.id, ex.id, name),
    onPick: picked => applyAutofill(block.id, ex.id, picked.name),
    library: library,
    onAddToLibrary: onAddToLibrary
  })), /*#__PURE__*/React.createElement(Segmented, {
    options: [{
      id: "reps",
      label: "Herhalingen"
    }, {
      id: "time",
      label: "Tijd"
    }],
    value: ex.mode,
    onChange: m => setExerciseMode(block.id, ex.id, m)
  }), ex.mode === "time" && /*#__PURE__*/React.createElement(Segmented, {
    options: [{
      id: "sec",
      label: "sec"
    }, {
      id: "min",
      label: "min"
    }],
    value: ex.durationUnit || "sec",
    onChange: u => setExerciseDurationUnit(block.id, ex.id, u)
  }), block.exercises.length > 1 && /*#__PURE__*/React.createElement(Btn, {
    variant: "danger",
    onClick: () => removeExerciseFromBlock(block.id, ex.id),
    style: {
      padding: "8px 10px"
    }
  }, "Verwijder")), partner && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Segmented, {
    options: [{
      id: "both",
      label: "Beiden"
    }, {
      id: "onlyPrimary",
      label: `Enkel ${clientName}`
    }, {
      id: "onlyPartner",
      label: `Enkel ${partner.name}`
    }],
    value: ex.sharedWith || "both",
    onChange: v => setExerciseSharedWith(block.id, ex.id, v)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, ex.sets.map((s, sIdx) => {
    const showBoth = !!partner && (ex.sharedWith || "both") === "both";
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: monoFont,
        fontSize: 11,
        color: COLORS.textFaint,
        width: 20
      }
    }, "#", sIdx + 1), showBoth && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        color: COLORS.textFaint,
        width: 66,
        flexShrink: 0
      }
    }, clientName, ":"), ex.mode === "time" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Input, {
      type: "number",
      placeholder: "tijd",
      value: s.duration === "" ? "" : ex.durationUnit === "min" ? Number(s.duration) / 60 : s.duration,
      onChange: e => {
        const raw = e.target.value;
        const seconds = raw === "" ? "" : String(ex.durationUnit === "min" ? Math.round(Number(raw) * 60) : Number(raw));
        updateSet(block.id, ex.id, s.id, "duration", seconds);
      },
      style: {
        width: 90,
        fontFamily: monoFont
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: COLORS.textFaint,
        fontSize: 11
      }
    }, ex.durationUnit === "min" ? "min" : "sec")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Input, {
      type: "number",
      placeholder: "reps",
      value: s.reps,
      onChange: e => updateSet(block.id, ex.id, s.id, "reps", e.target.value),
      style: {
        width: 90,
        fontFamily: monoFont
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: COLORS.textFaint,
        fontSize: 12
      }
    }, "×")), /*#__PURE__*/React.createElement(Input, {
      type: "number",
      placeholder: "kg",
      value: s.weight,
      onChange: e => updateSet(block.id, ex.id, s.id, "weight", e.target.value),
      style: {
        width: 90,
        fontFamily: monoFont
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: COLORS.textFaint,
        fontSize: 11
      }
    }, "kg"), ex.sets.length > 1 && /*#__PURE__*/React.createElement("span", {
      onClick: () => removeSet(block.id, ex.id, s.id),
      style: {
        color: COLORS.textFaint,
        fontSize: 11,
        cursor: "pointer",
        marginLeft: 4
      }
    }, "verwijder")), showBoth && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 20
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        color: COLORS.accent,
        width: 66,
        flexShrink: 0
      }
    }, partner.name, ":"), ex.mode === "time" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Input, {
      type: "number",
      placeholder: "tijd",
      value: s.durationB === "" ? "" : ex.durationUnit === "min" ? Number(s.durationB) / 60 : s.durationB,
      onChange: e => {
        const raw = e.target.value;
        const seconds = raw === "" ? "" : String(ex.durationUnit === "min" ? Math.round(Number(raw) * 60) : Number(raw));
        updateSet(block.id, ex.id, s.id, "durationB", seconds);
      },
      style: {
        width: 90,
        fontFamily: monoFont
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: COLORS.textFaint,
        fontSize: 11
      }
    }, ex.durationUnit === "min" ? "min" : "sec")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Input, {
      type: "number",
      placeholder: "reps",
      value: s.repsB || "",
      onChange: e => updateSet(block.id, ex.id, s.id, "repsB", e.target.value),
      style: {
        width: 90,
        fontFamily: monoFont
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: COLORS.textFaint,
        fontSize: 12
      }
    }, "×")), /*#__PURE__*/React.createElement(Input, {
      type: "number",
      placeholder: "kg",
      value: s.weightB || "",
      onChange: e => updateSet(block.id, ex.id, s.id, "weightB", e.target.value),
      style: {
        width: 90,
        fontFamily: monoFont
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: COLORS.textFaint,
        fontSize: 11
      }
    }, "kg")));
  }), /*#__PURE__*/React.createElement("span", {
    onClick: () => addSet(block.id, ex.id),
    style: {
      color: COLORS.accent,
      fontSize: 12,
      cursor: "pointer",
      marginTop: 2
    }
  }, "+ set toevoegen")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Opmerking bij deze oefening (optioneel) — bv. techniekfocus, tempo, ROM...",
    value: ex.notes || "",
    onChange: e => updateExerciseNotes(block.id, ex.id, e.target.value),
    style: {
      fontSize: 12.5
    }
  })))), /*#__PURE__*/React.createElement("span", {
    onClick: () => addExerciseToBlock(block.id),
    style: {
      color: COLORS.accent,
      fontSize: 12.5,
      cursor: "pointer",
      fontWeight: 600
    }
  }, "+ oefening toevoegen aan deze groep"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => addBlock("single", 1),
    style: {
      color: COLORS.accent,
      fontSize: 13,
      cursor: "pointer",
      fontWeight: 700
    }
  }, "+ Losse oefening"), /*#__PURE__*/React.createElement("span", {
    onClick: () => addBlock("superset", 2),
    style: {
      color: COLORS.accent,
      fontSize: 13,
      cursor: "pointer",
      fontWeight: 700
    }
  }, "+ Superset / triset / circuit")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => {
      resetForm();
      setShowForm(false);
      setEditingSessionId(null);
    }
  }, "Annuleer"), /*#__PURE__*/React.createElement(Btn, {
    onClick: saveSession
  }, editingSessionId ? "Wijzigingen opslaan" : "Sessie opslaan")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, sorted.length === 0 && !showForm && /*#__PURE__*/React.createElement("div", {
    style: {
      color: COLORS.textFaint,
      fontSize: 13
    }
  }, "Nog geen sessies gelogd. Klik op \"+ Nieuwe sessie\" om te starten."), sorted.map(s => {
    const open = expandedId === s.id;
    const totalExercises = (s.blocks || []).reduce((n, b) => n + b.exercises.length, 0);
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      style: {
        border: `1px solid ${COLORS.borderSoft}`,
        borderRadius: 8,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setExpandedId(open ? null : s.id),
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 14px",
        cursor: "pointer",
        background: COLORS.surface
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 14,
        alignItems: "baseline"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: monoFont,
        fontSize: 13,
        color: COLORS.text,
        fontWeight: 700
      }
    }, fmtDate(s.date)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: COLORS.textMuted
      }
    }, totalExercises, " oefening", totalExercises === 1 ? "" : "en"), s.duoWith && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: 700,
        color: COLORS.accent,
        border: `1px solid ${COLORS.accent}55`,
        borderRadius: 4,
        padding: "1px 7px"
      }
    }, "Duo met ", s.duoWith)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: COLORS.textFaint
      }
    }, open ? "▲" : "▼")), open && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px 16px",
        background: COLORS.bg
      }
    }, s.notes && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: 10,
        fontStyle: "italic"
      }
    }, s.notes), (s.blocks || []).map(b => /*#__PURE__*/React.createElement("div", {
      key: b.id,
      style: {
        marginBottom: 12
      }
    }, b.type !== "single" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-block",
        background: COLORS.accent,
        color: COLORS.white,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 4,
        marginBottom: 6
      }
    }, blockBadgeLabel(b.type)), b.exercises.map(ex => /*#__PURE__*/React.createElement("div", {
      key: ex.id,
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: COLORS.text,
        marginBottom: 4
      }
    }, ex.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 6
      }
    }, ex.sets.map(set => /*#__PURE__*/React.createElement("span", {
      key: set.id,
      style: {
        fontFamily: monoFont,
        fontSize: 12,
        background: COLORS.surfaceRaised,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 4,
        padding: "3px 8px",
        color: COLORS.textMuted
      }
    }, ex.mode === "time" ? `${fmtDuration(set.duration)}${set.weight ? ` · ${set.weight}kg` : ""}` : `${set.reps}×${set.weight || 0}kg`))), ex.notes && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: COLORS.textMuted,
        fontStyle: "italic",
        marginTop: 4
      }
    }, ex.notes))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 14,
        marginTop: 8,
        alignItems: "center",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      onClick: () => editSession(s),
      style: {
        color: COLORS.accent,
        fontSize: 12,
        cursor: "pointer",
        fontWeight: 600
      }
    }, "Bewerken"), /*#__PURE__*/React.createElement("span", {
      onClick: () => handleDownload(s),
      style: {
        color: COLORS.accent,
        fontSize: 12,
        cursor: "pointer",
        fontWeight: 600
      }
    }, "Download voor klant"), /*#__PURE__*/React.createElement("span", {
      onClick: () => handleCopy(s),
      style: {
        color: COLORS.accent,
        fontSize: 12,
        cursor: "pointer",
        fontWeight: 600
      }
    }, copiedId === s.id ? "Gekopieerd ✓" : "Kopieer als bericht"), /*#__PURE__*/React.createElement("span", {
      onClick: () => deleteSession(s.id),
      style: {
        color: COLORS.textFaint,
        fontSize: 12,
        cursor: "pointer"
      }
    }, "verwijderen"))));
  })));
}

// ================= Progressie tab =================
function ProgressieTab({
  data
}) {
  const exerciseNames = useMemo(() => {
    const set = new Set();
    data.sessions.forEach(s => (s.blocks || []).forEach(b => b.exercises.forEach(ex => ex.name && set.add(ex.name))));
    return Array.from(set).sort();
  }, [data.sessions]);
  const [selected, setSelected] = useState(exerciseNames[0] || "");
  useEffect(() => {
    if (!selected && exerciseNames.length) setSelected(exerciseNames[0]);
    if (selected && !exerciseNames.includes(selected)) setSelected(exerciseNames[0] || "");
  }, [exerciseNames]); // eslint-disable-line

  const {
    chartData,
    metric
  } = useMemo(() => {
    if (!selected) return {
      chartData: [],
      metric: "weight"
    };
    const raw = [];
    const sorted = [...data.sessions].sort((a, b) => a.date > b.date ? 1 : -1);
    sorted.forEach(s => {
      (s.blocks || []).forEach(b => {
        b.exercises.forEach(ex => {
          if (ex.name !== selected || ex.sets.length === 0) return;
          if (ex.mode === "time") {
            const topDuration = Math.max(...ex.sets.map(st => Number(st.duration) || 0));
            raw.push({
              date: s.date,
              label: fmtDate(s.date),
              value: topDuration,
              mode: "time"
            });
          } else {
            const topWeight = Math.max(...ex.sets.map(st => Number(st.weight) || 0));
            raw.push({
              date: s.date,
              label: fmtDate(s.date),
              value: topWeight,
              mode: "reps"
            });
          }
        });
      });
    });
    if (raw.length === 0) return {
      chartData: [],
      metric: "weight"
    };
    const dominantMode = raw[raw.length - 1].mode;
    const filtered = raw.filter(p => p.mode === dominantMode);
    let runningMax = -Infinity;
    filtered.forEach(p => {
      p.isPR = p.value > runningMax;
      if (p.isPR) runningMax = p.value;
    });
    return {
      chartData: filtered,
      metric: dominantMode === "time" ? "time" : "weight"
    };
  }, [selected, data.sessions]);
  const best = chartData.length ? Math.max(...chartData.map(p => p.value)) : null;
  if (exerciseNames.length === 0) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTitle, null, "Progressie"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: COLORS.textFaint,
        fontSize: 13
      }
    }, "Log eerst enkele trainingssessies om progressie te kunnen zien."));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionTitle, {
    sub: "Topwaarde per sessie, PR's gemarkeerd in wit"
  }, "Progressie"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 240
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: selected,
    onChange: e => setSelected(e.target.value),
    style: {
      fontFamily: bodyFont,
      fontSize: 13,
      background: COLORS.bg,
      color: COLORS.text,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 5,
      padding: "8px 10px",
      width: "100%"
    }
  }, exerciseNames.map(n => /*#__PURE__*/React.createElement("option", {
    key: n,
    value: n
  }, n)))), best !== null && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: monoFont,
      fontSize: 12,
      color: COLORS.white,
      background: COLORS.accent,
      borderRadius: 6,
      padding: "7px 12px",
      fontWeight: 700
    }
  }, "PR: ", metric === "time" ? fmtDuration(best) : `${best} kg`)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      padding: "18px 10px 8px",
      height: 320
    }
  }, chartData.length < 2 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: COLORS.textFaint,
      fontSize: 13,
      padding: "0 14px"
    }
  }, "Nog te weinig datapunten voor \"", selected, "\". Log nog een sessie met deze oefening.") : /*#__PURE__*/React.createElement(MiniLineChart, {
    data: chartData,
    formatY: v => metric === "time" ? fmtDuration(v) : `${Math.round(v)}kg`,
    height: 280
  })));
}

// ================= Metingen tab =================
function MetingenTab({
  data,
  persist
}) {
  const [showForm, setShowForm] = useState(false);
  const empty = {
    date: todayISO(),
    weight: "",
    bodyFat: "",
    fatFreeMass: "",
    muscleMass: "",
    bodyWater: "",
    boneMass: "",
    visceralFat: "",
    bmr: "",
    metabolicAge: "",
    notes: ""
  };
  const [form, setForm] = useState(empty);
  const hasAnyValue = f => [f.weight, f.bodyFat, f.fatFreeMass, f.muscleMass, f.bodyWater, f.boneMass, f.visceralFat, f.bmr, f.metabolicAge].some(v => v !== "");
  const saveMeasurement = () => {
    if (!hasAnyValue(form)) return;
    const entry = {
      id: uid(),
      ...form
    };
    const measurements = [entry, ...data.measurements].sort((a, b) => a.date < b.date ? 1 : -1);
    persist({
      ...data,
      measurements
    });
    setForm(empty);
    setShowForm(false);
  };
  const deleteMeasurement = id => persist({
    ...data,
    measurements: data.measurements.filter(m => m.id !== id)
  });
  const sorted = [...data.measurements].sort((a, b) => a.date < b.date ? 1 : -1);
  const weightChart = useMemo(() => {
    return [...data.measurements].filter(m => m.weight !== "").sort((a, b) => a.date > b.date ? 1 : -1).map(m => ({
      label: fmtDate(m.date),
      value: Number(m.weight)
    }));
  }, [data.measurements]);
  const fields = [["weight", "Gewicht (kg)"], ["bodyFat", "Vetpercentage (%)"], ["fatFreeMass", "Vetvrije massa (kg)"], ["muscleMass", "Spiermassa (kg)"], ["bodyWater", "Lichaamswater (%)"], ["boneMass", "Botmassa (kg)"], ["visceralFat", "Visceraal vetniveau"], ["bmr", "BMR (kcal)"], ["metabolicAge", "Metabolische leeftijd (jaar)"]];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(SectionTitle, {
    sub: `${sorted.length} meting${sorted.length === 1 ? "" : "en"} gelogd — velden van je Tanita-impedantiemeter`
  }, "Lichaamsmetingen"), !showForm && /*#__PURE__*/React.createElement(Btn, {
    onClick: () => setShowForm(true)
  }, "+ Nieuwe meting")), showForm && /*#__PURE__*/React.createElement("div", {
    style: {
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      padding: 18,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      width: 180
    }
  }, /*#__PURE__*/React.createElement(Label, null, "Datum"), /*#__PURE__*/React.createElement(Input, {
    type: "date",
    value: form.date,
    onChange: e => setForm(f => ({
      ...f,
      date: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: 12,
      marginBottom: 12
    }
  }, fields.map(([key, label]) => /*#__PURE__*/React.createElement("div", {
    key: key
  }, /*#__PURE__*/React.createElement(Label, null, label), /*#__PURE__*/React.createElement(Input, {
    type: "number",
    value: form[key],
    onChange: e => setForm(f => ({
      ...f,
      [key]: e.target.value
    })),
    style: {
      fontFamily: monoFont
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Label, null, "Notities (optioneel)"), /*#__PURE__*/React.createElement(Input, {
    placeholder: "bv. 's ochtends nuchter gemeten",
    value: form.notes,
    onChange: e => setForm(f => ({
      ...f,
      notes: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    onClick: () => {
      setForm(empty);
      setShowForm(false);
    }
  }, "Annuleer"), /*#__PURE__*/React.createElement(Btn, {
    onClick: saveMeasurement
  }, "Meting opslaan"))), weightChart.length >= 2 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      padding: "18px 10px 8px",
      height: 240,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(MiniLineChart, {
    data: weightChart,
    formatY: v => `${Math.round(v)}kg`,
    height: 200
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, sorted.length === 0 && !showForm && /*#__PURE__*/React.createElement("div", {
    style: {
      color: COLORS.textFaint,
      fontSize: 13
    }
  }, "Nog geen metingen gelogd."), sorted.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.id,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      border: `1px solid ${COLORS.borderSoft}`,
      borderRadius: 8,
      padding: "10px 14px",
      background: COLORS.surface
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      alignItems: "baseline",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: monoFont,
      fontSize: 13,
      color: COLORS.text,
      fontWeight: 700,
      width: 90
    }
  }, fmtDate(m.date)), m.weight && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: COLORS.textMuted
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, m.weight), " kg"), m.bodyFat && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: COLORS.textMuted
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, m.bodyFat), "% vet"), m.fatFreeMass && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: COLORS.textMuted
    }
  }, "vetvrij ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, m.fatFreeMass), "kg"), m.muscleMass && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: COLORS.textMuted
    }
  }, "spier ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, m.muscleMass), "kg"), m.bodyWater && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: COLORS.textMuted
    }
  }, "water ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, m.bodyWater), "%"), m.boneMass && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: COLORS.textMuted
    }
  }, "bot ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, m.boneMass), "kg"), m.visceralFat && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: COLORS.textMuted
    }
  }, "visceraal ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, m.visceralFat)), m.bmr && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: COLORS.textMuted
    }
  }, "BMR ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, m.bmr), "kcal"), m.metabolicAge && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: COLORS.textMuted
    }
  }, "metab. leeftijd ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, m.metabolicAge), "j"), m.waist && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: COLORS.textMuted
    }
  }, "taille ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, m.waist), "cm"), m.chest && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: COLORS.textMuted
    }
  }, "borst ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, m.chest), "cm"), m.arm && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: COLORS.textMuted
    }
  }, "arm ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: COLORS.text
    }
  }, m.arm), "cm")), /*#__PURE__*/React.createElement("span", {
    onClick: () => deleteMeasurement(m.id),
    style: {
      color: COLORS.accent,
      fontSize: 12,
      cursor: "pointer"
    }
  }, "verwijder")))));
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/React.createElement(TrainingTracker, null));