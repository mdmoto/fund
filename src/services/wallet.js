// Solana wallet utilities - uses dynamic imports to support Vite + Browser

export const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC || 'https://api.devnet.solana.com'
export const MAO_MINT = import.meta.env.VITE_MAO_MINT || 'GH9mvRrmoXhZktsr7tJdQcoGTEqV4PVq7tAm67pRdW7c'

/**
 * Generate a new Solana keypair with a BIP39 mnemonic
 * User MUST save the mnemonic themselves — we never store it
 */
export async function generateNewWallet() {
  const [{ Keypair }, bip39, { derivePath }, { default: bs58 }] = await Promise.all([
    import('@solana/web3.js'),
    import('bip39'),
    import('ed25519-hd-key'),
    import('bs58'),
  ])
  const mnemonic = bip39.generateMnemonic(128)
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key
  const keypair = Keypair.fromSeed(derivedSeed)
  return {
    mnemonic,
    publicKey: keypair.publicKey.toBase58(),
    secretKey: bs58.encode(keypair.secretKey),
  }
}

/**
 * Recover a wallet from mnemonic
 */
export async function walletFromMnemonic(mnemonic) {
  const [{ Keypair }, bip39, { derivePath }] = await Promise.all([
    import('@solana/web3.js'),
    import('bip39'),
    import('ed25519-hd-key'),
  ])
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key
  const keypair = Keypair.fromSeed(derivedSeed)
  return keypair.publicKey.toBase58()
}

/**
 * Get MAO token balance for a given wallet address
 */
export async function getMaoBalance(walletAddress) {
  try {
    const [{ PublicKey, Connection }, { getAccount, getAssociatedTokenAddress }] = await Promise.all([
      import('@solana/web3.js'),
      import('@solana/spl-token'),
    ])
    const connection = new Connection(SOLANA_RPC, 'confirmed')
    const owner = new PublicKey(walletAddress)
    const mint = new PublicKey(MAO_MINT)
    const ata = await getAssociatedTokenAddress(mint, owner)
    const account = await getAccount(connection, ata)
    return Number(account.amount) / 1_000_000
  } catch {
    return 0
  }
}

/**
 * Get SOL balance
 */
export async function getSolBalance(walletAddress) {
  try {
    const { PublicKey, Connection } = await import('@solana/web3.js')
    const connection = new Connection(SOLANA_RPC, 'confirmed')
    const pk = new PublicKey(walletAddress)
    const lamports = await connection.getBalance(pk)
    return lamports / 1e9
  } catch {
    return 0
  }
}

/**
 * Shorten a Solana address for display
 */
export function shortenAddr(addr, chars = 4) {
  if (!addr) return ''
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`
}

/**
 * Check if Phantom is installed
 */
export function isPhantomInstalled() {
  return typeof window !== 'undefined' && !!window.solana?.isPhantom
}

/**
 * Connect Phantom wallet
 */
export async function connectPhantom() {
  if (!isPhantomInstalled()) throw new Error('Phantom not installed')
  const resp = await window.solana.connect()
  return resp.publicKey.toBase58()
}

/**
 * Fibonacci milestone thresholds (in units of $100K)
 */
export const FIBONACCI_MILESTONES = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55]

export function getMilestoneInfo(totalSalesUSD) {
  const units = totalSalesUSD / 100_000
  let currentMilestone = 0
  for (let i = 0; i < FIBONACCI_MILESTONES.length; i++) {
    if (units >= FIBONACCI_MILESTONES[i]) currentMilestone = i
    else break
  }
  const nextMilestone = currentMilestone + 1
  const currentThreshold = FIBONACCI_MILESTONES[currentMilestone] * 100_000
  const nextThreshold = nextMilestone < FIBONACCI_MILESTONES.length
    ? FIBONACCI_MILESTONES[nextMilestone] * 100_000
    : null
  const progress = nextThreshold
    ? ((totalSalesUSD - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100
  return {
    currentMilestone,
    nextMilestone,
    currentThreshold,
    nextThreshold,
    progress: Math.min(progress, 100),
    remaining: nextThreshold ? nextThreshold - totalSalesUSD : 0,
  }
}
