// Maps human colour names to swatch hex values used across cards and the PDP.
const MAP = {
  Black: '#1c1c1c',
  White: '#f2f2ef',
  Orange: '#e8722a',
  Blue: '#2f6fd0',
  'Royal Blue': '#23409a',
  'Nado Pink': '#e85d9a',
  Yellow: '#f2c400',
  Grey: '#8a9199',
  'Forest Green': '#2f6b3a',
  Classic: '#1c1c1c',
  Standard: '#4a5a44',
}

export const colorHex = (name) => MAP[name] || '#9aa39a'
