<script setup>
import { ref } from 'vue'
import MaterialIcon from '../MaterialIcon.vue'

/**
 * BoletoKycForm — the KYC form CheckoutStepBody swaps in (replacing the
 * channel grid/promo code, both orientations) once the Boleto BR channel is
 * selected and Buy Now is tapped. Prototype-only: local, unwired inputs — no
 * submit action exists yet (mirrors PromoCode.vue's own "no real backend"
 * scope). Copy is fixed Portuguese regardless of store locale — Boleto is a
 * Brazil-only payment instrument, same precedent as the channel list's own
 * hardcoded "PayPal"/"Cash App" labels never running through the locale
 * system either.
 *
 * Field markup/CSS follows this repo's established input pattern (StepZipCode.vue/
 * StepDetails.vue's `<input>` + `--x-border-input-*`/`--x-bg-input-*` tokens,
 * no shared Input component exists) rather than introducing a new one.
 */
defineEmits(['back'])

const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const email = ref('')
const dob = ref('')
const cpf = ref('')
</script>

<template>
  <div class="boleto-kyc">
    <button v-ripple type="button" class="boleto-kyc__back" @click="$emit('back')">
      <MaterialIcon name="arrow_back" variant="round" :size="18" />
      <span class="text-style-utility-label-regular">Voltar</span>
    </button>

    <p class="boleto-kyc__intro text-style-utility-label-regular">
      Por favor, use o mesmo endereço de email que voce gostaria de receber seu voucher com o código de resgate.
    </p>

    <div class="boleto-kyc__fields">
      <input v-model="firstName" type="text" class="boleto-kyc__box text-style-utility-label-regular" placeholder="Primeiro nome" />
      <input v-model="lastName" type="text" class="boleto-kyc__box text-style-utility-label-regular" placeholder="Sobrenome" />

      <div class="boleto-kyc__box boleto-kyc__phone">
        <span class="boleto-kyc__phone-code text-style-utility-label-regular">+55</span>
        <span class="boleto-kyc__phone-divider" aria-hidden="true"></span>
        <input v-model="phone" type="tel" class="boleto-kyc__phone-input text-style-utility-label-regular" placeholder="Número de telefone" />
      </div>

      <input v-model="email" type="email" class="boleto-kyc__box text-style-utility-label-regular" placeholder="E-mail" />

      <div class="boleto-kyc__box boleto-kyc__dob">
        <MaterialIcon name="calendar_today" variant="round" :size="18" class="boleto-kyc__dob-icon" />
        <input v-model="dob" type="text" class="boleto-kyc__dob-input text-style-utility-label-regular" placeholder="Data de nascimento" />
      </div>

      <input v-model="cpf" type="text" class="boleto-kyc__box text-style-utility-label-regular" placeholder="Número de CPF" />
    </div>
  </div>
</template>

<style scoped>
.boleto-kyc {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
}

.boleto-kyc__back {
  display: inline-flex;
  align-items: center;
  gap: var(--x-gap-content-tight);
  align-self: flex-start;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--x-text-body-default);
  cursor: pointer;
}

.boleto-kyc__intro {
  margin: 0;
  color: var(--x-text-body-default);
}

.boleto-kyc__fields {
  display: flex;
  flex-direction: column;
  gap: var(--x-gap-content-default);
  width: 100%;
}

/* Shared field-box chrome — applied directly to a plain `<input>` for the
   single-value fields, and to a wrapping `<div>` for the composite phone/DOB
   fields (icon or country-code chip + input, one bordered box). */
.boleto-kyc__box {
  width: 100%;
  height: var(--x-size-input-m);
  border: var(--border-weight-default) solid var(--x-border-input-default);
  border-radius: var(--x-radius-input-s);
  background: var(--x-bg-input-default);
  box-sizing: border-box;
}
input.boleto-kyc__box {
  padding: 0 var(--x-pad-surface-s);
  color: var(--x-text-body-default);
  display: block;
  transform: none;
  line-height: 1;
  outline: none;
}
input.boleto-kyc__box::placeholder { color: var(--x-text-placeholder); }
input.boleto-kyc__box:focus { border-color: var(--x-border-input-focused); }

div.boleto-kyc__box {
  display: flex;
  align-items: center;
  gap: var(--x-gap-content-narrow);
  padding: 0 var(--x-pad-surface-s);
}
div.boleto-kyc__box:focus-within { border-color: var(--x-border-input-focused); }

.boleto-kyc__phone-code {
  flex-shrink: 0;
  color: var(--x-text-body-default);
}
.boleto-kyc__phone-divider {
  flex-shrink: 0;
  width: var(--border-weight-default);
  height: var(--x-size-icon-m);
  background: var(--x-border-input-default);
}
.boleto-kyc__phone-input,
.boleto-kyc__dob-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  color: var(--x-text-body-default);
  display: block;
  transform: none;
  line-height: 1;
  outline: none;
  padding: 0;
}
.boleto-kyc__phone-input::placeholder,
.boleto-kyc__dob-input::placeholder { color: var(--x-text-placeholder); }

.boleto-kyc__dob-icon {
  flex-shrink: 0;
  /* --x-text-body-soft read too faint at this glyph's thin stroke weight —
     bump to the same visibility tier as the "Voltar" back-arrow icon
     (inherited from .boleto-kyc__back's own --x-text-body-default). */
  color: var(--x-text-body-default);
}
</style>
