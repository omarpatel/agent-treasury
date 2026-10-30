# Deploying Agent Treasury

`setup.sh` turns a fresh Ubuntu 22.04/24.04 VM into a running Agent Treasury node behind HTTPS. It never
contains secrets — it reads them from `$APP_DIR/secrets/` (which you copy to the box) and composes
`/opt/agent-treasury/.env` there.

## What you provide once (only you can)

1. **A server.** A Google Cloud `e2-medium` (2 vCPU / 4 GB) Ubuntu 24.04 VM with HTTP+HTTPS allowed is
   plenty (agents run Docker containers, so ≥4 GB is comfortable). Note its external IP.
2. **DNS.** In Porkbun, point your domain's `A` record at that IP (and a `www` CNAME if you want).
3. **Brains.** Either an x402 LLM gateway URL (`LLM_PROVIDER=x402`, `X402_GATEWAY_URL=…`) or a provider
   key (`LLM_PROVIDER=router` + `ANTHROPIC_API_KEY`/…). Until then it runs `LLM_PROVIDER=mock`.

## The secrets bundle

Generated off-repo (never committed). The bundle is a directory `secrets/` containing:

```
treasury.json  escrow.json   # signing keypairs (solana-cli byte-array format)
founder.json   protocol.json # (you keep these; only their public addresses go in .env)
kek.txt        session.txt   # KEY_ENCRYPTION_KEY, SESSION_SECRET
rpc-devnet.txt rpc-mainnet.txt  # your Helius RPC URLs (contain the api key)
```

## Bring-up

```sh
# from your machine, once the VM exists and DNS points at it:
scp -r ./secrets   user@SERVER_IP:/tmp/secrets
ssh user@SERVER_IP 'sudo mkdir -p /opt/agent-treasury && sudo git clone https://github.com/omarpatel/agent-treasury /opt/agent-treasury \
  && sudo mv /tmp/secrets /opt/agent-treasury/secrets'
ssh user@SERVER_IP 'sudo DOMAIN=example.com CLUSTER=devnet \
  FOUNDER_PUBKEY=<FOUNDER_PUBKEY> \
  PROTOCOL_PUBKEY=<PROTOCOL_PUBKEY> \
  bash /opt/agent-treasury/deploy/setup.sh'
```

`setup.sh` is idempotent — re-run it after `git pull` to redeploy. Then:

```sh
curl -s https://example.com/api/health        # mode actually in force
journalctl -u agent_treasury -f                          # logs
```

## Fund the treasury (devnet)

- SOL for gas: `solana airdrop 2 <TREASURY_PUBKEY>` (rate-limited) or the browser faucet.
- USDC: https://faucet.circle.com → Solana Devnet → paste the treasury address.

## Going to mainnet

Only after you've watched a devnet purchase settle end to end. Re-run with `CLUSTER=mainnet-beta`
(the script adds `ALLOW_MAINNET=1`) and set `USDC_MINT`. Read `docs/OPERATIONS.md` first.
