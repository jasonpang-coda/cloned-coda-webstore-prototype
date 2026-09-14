<script setup>
/**
 * Publish panel: git status → commit → push (Part 4b, fs-writer mode only),
 * Vercel deployment status (Part 4b), and Vercel project creation (Part 4a).
 * Commit/push are deliberately TWO separate button presses — pushing is a
 * shared, hard-to-reverse action, so it never happens as a side effect of
 * anything else. Same for project creation: it creates real infrastructure
 * in whatever Vercel account VERCEL_TOKEN belongs to, so it's confirm-gated
 * exactly like push, never automatic.
 *
 * In github-writer mode (CMS_WRITER=github — the hosted CMS, Part 4c) every
 * write already IS a commit (see server/writers/github.mjs), so the git
 * status/commit/push section doesn't apply and is replaced with a short
 * explanation instead of a broken form.
 */
import { ref, watch, onMounted } from 'vue'
import { api } from '../api.js'

const props = defineProps({ storeKey: { type: String, required: true } })

const writerInfo = ref(null)
onMounted(async () => { writerInfo.value = await api.writerInfo().catch(() => null) })

const status = ref(null)
const statusError = ref(null)
const message = ref('')
const newBranch = ref(false)
const committing = ref(false)
const commitResult = ref(null)
const commitError = ref(null)

const pushConfirming = ref(false)
const pushing = ref(false)
const pushResult = ref(null)
const pushError = ref(null)

const deployments = ref(null)
const deploymentsError = ref(null)

const vercelConfirming = ref(false)
const vercelCreating = ref(false)
const vercelResult = ref(null)
const vercelError = ref(null)
const linkEnvVars = ref(true)

async function loadStatus () {
  if (writerInfo.value?.mode === 'github') return
  statusError.value = null
  try {
    status.value = await api.gitStatus(props.storeKey)
  } catch (e) {
    statusError.value = e.message
  }
}

async function loadDeployments () {
  deploymentsError.value = null
  try {
    deployments.value = await api.deployments(props.storeKey)
  } catch (e) {
    deploymentsError.value = e.message
  }
}

watch(() => props.storeKey, () => {
  status.value = null; commitResult.value = null; pushResult.value = null; deployments.value = null
  vercelResult.value = null; vercelConfirming.value = false
  loadStatus(); loadDeployments()
}, { immediate: true })

async function commit () {
  committing.value = true
  commitError.value = null
  commitResult.value = null
  try {
    commitResult.value = await api.commit(props.storeKey, { message: message.value, newBranch: newBranch.value })
    message.value = ''
    await loadStatus()
  } catch (e) {
    commitError.value = e.message
  } finally {
    committing.value = false
  }
}

async function push () {
  pushing.value = true
  pushError.value = null
  pushResult.value = null
  try {
    pushResult.value = await api.push(props.storeKey)
  } catch (e) {
    pushError.value = e.message
  } finally {
    pushing.value = false
    pushConfirming.value = false
  }
}

async function createVercelProject () {
  vercelCreating.value = true
  vercelError.value = null
  vercelResult.value = null
  try {
    vercelResult.value = await api.createVercelProject(props.storeKey, { linkEnvVars: linkEnvVars.value })
    await loadDeployments()
  } catch (e) {
    vercelError.value = e.message
  } finally {
    vercelCreating.value = false
    vercelConfirming.value = false
  }
}

const READY_STATE_COLOR = { READY: '#4caf50', ERROR: '#ff6b6b', CANCELED: '#888', BUILDING: '#e8a33d', QUEUED: '#e8a33d', INITIALIZING: '#e8a33d', BLOCKED: '#888' }
</script>

<template>
  <div class="publish">
    <section v-if="writerInfo?.mode === 'github'" class="publish__section">
      <h3>Git status</h3>
      <p class="publish__empty">
        Not applicable — this CMS is running in github-writer mode, where every write already is a
        commit (see <code>server/writers/github.mjs</code>) to a <code>store/{{ storeKey }}</code>
        branch on GitHub directly. There's no local checkout to show status for.
      </p>
    </section>

    <template v-else>
      <section class="publish__section">
        <h3>Git status <span v-if="status" class="publish__branch">on <code>{{ status.branch }}</code></span></h3>
        <p v-if="statusError" class="publish__error">{{ statusError }}</p>
        <ul v-else-if="status?.changes.length" class="publish__changes">
          <li v-for="c in status.changes" :key="c.path"><code>{{ c.status }}</code> {{ c.path }}</li>
        </ul>
        <p v-else-if="status" class="publish__empty">No uncommitted changes for this store.</p>

        <div class="publish__commit">
          <textarea v-model="message" rows="2" placeholder="Commit message"></textarea>
          <label class="publish__checkbox">
            <input type="checkbox" v-model="newBranch" />
            Create/switch to <code>store/{{ storeKey }}</code> first
            <span class="publish__hint">(switches your repo's checked-out branch — leave off to commit on the current branch)</span>
          </label>
          <button :disabled="committing || !status?.changes.length || !message.trim()" @click="commit">
            {{ committing ? 'Committing…' : 'Commit' }}
          </button>
          <p v-if="commitError" class="publish__error">{{ commitError }}</p>
          <p v-if="commitResult?.committed" class="publish__ok">
            Committed {{ commitResult.files.length }} file(s) to <code>{{ commitResult.branch }}</code>.
          </p>
        </div>
      </section>

      <section class="publish__section">
        <h3>Push</h3>
        <p class="publish__hint">Pushes the current branch to <code>origin</code> — this reaches the shared remote and (per docs/deploying-individual-stores.md) triggers a Vercel deployment for every store project. Confirm before doing this.</p>
        <button v-if="!pushConfirming" @click="pushConfirming = true">Push to origin…</button>
        <div v-else class="publish__confirm">
          <span>Push <code>{{ status?.branch }}</code> to <code>origin</code>?</span>
          <button :disabled="pushing" @click="push">{{ pushing ? 'Pushing…' : 'Yes, push' }}</button>
          <button @click="pushConfirming = false">Cancel</button>
        </div>
        <p v-if="pushError" class="publish__error">{{ pushError }}</p>
        <p v-if="pushResult" class="publish__ok">Pushed <code>{{ pushResult.branch }}</code>.</p>
      </section>
    </template>

    <section class="publish__section">
      <h3>Vercel project</h3>
      <p class="publish__hint">
        Creates a Vercel project for this store (name <code>sku-card-{{ storeKey }}</code>,
        Build Command <code>npx vite build --mode {{ storeKey }}</code>) — real infrastructure in
        whatever account <code>VERCEL_TOKEN</code> belongs to. Confirm before doing this.
      </p>
      <label class="publish__checkbox">
        <input type="checkbox" v-model="linkEnvVars" />
        Copy VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to the new project (for comment mode)
      </label>
      <button v-if="!vercelConfirming" @click="vercelConfirming = true">Create Vercel project…</button>
      <div v-else class="publish__confirm">
        <span>Create project <code>sku-card-{{ storeKey }}</code>?</span>
        <button :disabled="vercelCreating" @click="createVercelProject">{{ vercelCreating ? 'Creating…' : 'Yes, create' }}</button>
        <button @click="vercelConfirming = false">Cancel</button>
      </div>
      <p v-if="vercelError" class="publish__error">{{ vercelError }}</p>
      <p v-if="vercelResult" class="publish__ok">
        Created <code>{{ vercelResult.name }}</code>
        <span v-if="vercelResult.envVars?.created?.length"> and linked {{ vercelResult.envVars.created.length }} env var(s)</span>.
        Find it under your Vercel dashboard.
      </p>
    </section>

    <section class="publish__section">
      <h3>Vercel deployments <button class="publish__refresh" @click="loadDeployments">↻</button></h3>
      <p v-if="deploymentsError" class="publish__error">{{ deploymentsError }}</p>
      <template v-else-if="deployments">
        <p v-if="!deployments.configured" class="publish__empty">
          Not configured. Set <code>VERCEL_TOKEN</code> in <code>.env.local</code> to see deployment
          status here (see <code>.env.example</code>). Expected project name:
          <code>{{ deployments.project }}</code>.
        </p>
        <p v-else-if="deployments.error" class="publish__error">{{ deployments.error }}</p>
        <p v-else-if="!deployments.deployments?.length" class="publish__empty">
          No deployments found for project <code>{{ deployments.project }}</code>.
        </p>
        <ul v-else class="publish__deployments">
          <li v-for="d in deployments.deployments" :key="d.uid">
            <span class="publish__dot" :style="{ background: READY_STATE_COLOR[d.readyState] ?? '#888' }"></span>
            <a :href="`https://${d.url}`" target="_blank" rel="noopener">{{ d.url }}</a>
            <span class="publish__meta">{{ d.readyState }} · {{ d.target ?? 'preview' }}</span>
          </li>
        </ul>
      </template>
    </section>
  </div>
</template>

<style scoped>
.publish { padding: 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
.publish__section h3 { margin: 0 0 0.5rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; }
.publish__branch { font-weight: normal; opacity: 0.7; font-size: 0.8rem; }
.publish__changes, .publish__deployments { list-style: none; margin: 0 0 0.75rem; padding: 0; font-size: 0.82rem; }
.publish__changes li { font-family: monospace; padding: 0.15rem 0; }
.publish__deployments li { display: flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0; }
.publish__dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.publish__deployments a { color: #6ea8ff; }
.publish__meta { opacity: 0.6; font-size: 0.75rem; }
.publish__empty { opacity: 0.6; font-size: 0.85rem; }
.publish__error { color: #ff6b6b; font-size: 0.85rem; }
.publish__ok { color: #4caf50; font-size: 0.85rem; }
.publish__hint { font-size: 0.75rem; opacity: 0.65; }
.publish__commit { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
.publish__commit textarea { font: inherit; padding: 0.5rem; background: var(--cms-input-bg, #1a1a1e); color: inherit; border: 1px solid var(--cms-border, #2a2a2e); border-radius: 4px; }
.publish__checkbox { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; flex-wrap: wrap; }
.publish__confirm { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
button { padding: 0.45rem 0.9rem; background: #3d7eff; color: white; border: none; border-radius: 4px; cursor: pointer; font: inherit; align-self: flex-start; }
button:disabled { opacity: 0.5; cursor: default; }
.publish__refresh { padding: 0.1rem 0.4rem; font-size: 0.8rem; }
</style>
