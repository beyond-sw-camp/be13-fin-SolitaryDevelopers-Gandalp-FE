<template>
  <v-dialog :model-value="show" @update:model-value="$emit('update:show', $event)" width="1000" scrollable>
    <v-card>
      <v-card-title class="text-h6">공정도 통계</v-card-title>
      <v-card-text>
        <v-container fluid class="pa-2">
            <v-row dense no-gutters>
                <v-col
                    v-for="n in fairnessList"
                    :key="n.nurseId"
                    cols="12"
                    sm="6"
                    md="4"
                    class="pa-2"
                    >
                <v-card outlined class="pa-3" style="background-color: #f9f9f9; border-radius: 12px; box-shadow: 2px 2px 8px rgba(0,0,0,0.05); width:max-content;">
                    <h3 style="font-weight: bold; font-size: 16px; margin-top: 5px;">{{ n.nurseName }}</h3>
                    <v-divider class="my-2" />
                    <div><span style="font-weight: bold;">데이</span> ➜ 누적: {{ n.dayWorked }} / 임시: {{ n.tempDayWorked }} / 합계: <span style="font-weight: bold;">{{ n.dayWorked + n.tempDayWorked }}</span></div>
                    <div><span style="font-weight: bold;">이브닝</span> ➜ 누적: {{ n.eveningWorked }} / 임시: {{ n.tempEveningWorked }} / 합계: <span style="font-weight: bold;">{{ n.eveningWorked + n.tempEveningWorked }}</span></div>
                    <div><span style="font-weight: bold;">나이트</span> ➜ 누적: {{ n.nightWorked }} / 임시: {{ n.tempNightWorked }} / 합계: <span style="font-weight: bold;">{{ n.nightWorked + n.tempNightWorked }}</span></div>
                    <v-divider class="my-2" />
                    <div><span style="font-weight: bold; color: #d32f2f;">총 근무</span> ➜ 누적: {{ n.totalWorked }} / 임시: {{ n.tempTotalWorked }} / 합계: <span style="font-weight: bold;">{{ n.totalWorked + n.tempTotalWorked }}</span></div>
                </v-card>
                </v-col>
            </v-row>
            </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="close">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  fairnessList: Array
})
const emit = defineEmits(['close'])

const close = () => emit('close')
</script>
