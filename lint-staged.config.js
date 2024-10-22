export default {
  '*.{js,ts,json}': [
    () => 'tsc --noEmit --skipLibCheck',
    () => 'biome check --write'
  ]
}
