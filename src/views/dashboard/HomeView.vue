<script setup>
import { onMounted, ref } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const dateRange = ref(null)
onMounted(() => {

})
</script>
<template>
    <div class="row">
        <div class="col-md-12 mb-4 mt-1">
            <div class="d-flex flex-wrap justify-content-between align-items-center">
                <h4 class="font-weight-bold">{{ $t('overview') }}</h4>
                <div class="form-group mb-0 vanila-daterangepicker d-flex flex-row">
                    <VueDatePicker v-model="dateRange" range placeholder="Select Date Range" />
                </div>
            </div>
        </div>
        <div class="col-lg-8 col-md-12">
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="">
                                    <p class="mb-2 text-secondary">{{ $t('total_branches') }}</p>
                                    <div class="d-flex flex-wrap justify-content-start align-items-center">
                                        <h5 class="mb-0 font-weight-bold">1,234</h5>
                                        <p class="mb-0 ml-3 text-success font-weight-bold">+2.5%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="">
                                    <p class="mb-2 text-secondary">{{ $t('total_employees') }}</p>
                                    <div class="d-flex flex-wrap justify-content-start align-items-center">
                                        <h5 class="mb-0 font-weight-bold">1,234</h5>
                                        <p class="mb-0 ml-3 text-success font-weight-bold">+2.5%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="">
                                    <p class="mb-2 text-secondary">{{ $t('present_employees') }}</p>
                                    <div class="d-flex flex-wrap justify-content-start align-items-center">
                                        <h5 class="mb-0 font-weight-bold">890</h5>
                                        <p class="mb-0 ml-3 text-success font-weight-bold">+2.67%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="">
                                    <p class="mb-2 text-secondary">{{ $t('absent_employees') }}</p>
                                    <div class="d-flex flex-wrap justify-content-start align-items-center">
                                        <h5 class="mb-0 font-weight-bold">567</h5>
                                        <p class="mb-0 ml-3 text-danger font-weight-bold">-1.23%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>