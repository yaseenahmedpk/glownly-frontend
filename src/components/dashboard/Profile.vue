<template>
  <div class="row">
    <div class="col-lg-4">
      <div class="card card-block card-stretch card-height">
        <div class="card-body">
          <div class="d-flex align-items-center mb-3">
            <div class="profile-img position-relative">
              <img :src="profileImage || defaultProfilePic" class="avatar-130 img-fluid" alt="profile-pic">
            </div>
            <div class="ml-3">
              <h4 class="mb-1">{{ profileData?.profileDetails?.first_name }} {{ profileData?.profileDetails?.last_name
                }}</h4>
            </div>
          </div>
          <div class="d-flex align-items-center mb-3">
            <div class="p-icon mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="text-primary" width="20" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <p class="mb-0 eml">{{ profileData?.profileDetails?.email }}</p>
          </div>
          <div class="d-flex align-items-center mb-3">
            <div class="p-icon mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="text-primary" width="20" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
            </div>
            <p class="mb-0">{{ profileData?.profileDetails?.mobile_number || 'N/A' }}</p>
          </div>
          <div class="d-flex align-items-center mb-3">
            <div class="p-icon mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="text-primary" width="20" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p class="mb-0">{{ profileData?.profileDetails?.city || 'N/A' }}, {{ profileData?.profileDetails?.state_name
              || '' }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-8">
      <div class="card card-block card-stretch card-height shadow-sm border-0">
        <div class="card-body p-4">
          <!-- Header -->
          <div class="d-flex align-items-center justify-content-between mb-4">
            <div class="d-flex align-items-center">
              <div class="p-icon mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="text-primary" width="24" height="24" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 class="card-title mb-0 font-weight-bold">{{ $t('about_me') }}</h4>
            </div>
            <RouterLink to="/edit-profile" class="btn btn-sm btn-outline-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              {{ $t('edit_profile') }}
            </RouterLink>
          </div>

          <!-- Personal Details Grid -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </div>
                <div>
                  <div class="text-muted small">{{ $t('gender') }}</div>
                  <div class="font-weight-bold">{{ profileData?.profileDetails?.gender === 0 ? 'Female' : 'Male' }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                  </svg>

                </div>
                <div>
                  <div class="text-muted small">{{ $t('language') }}</div>
                  <div class="font-weight-bold">{{ profileData?.profileDetails?.language_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>

                </div>
                <div>
                  <div class="text-muted small">{{ $t('timezone') }}</div>
                  <div class="font-weight-bold">{{ profileData?.profileDetails?.timezone_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                  </svg>

                </div>
                <div>
                  <div class="text-muted small">{{ $t('country') }}</div>
                  <div class="font-weight-bold">{{ profileData?.profileDetails?.country_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                  </svg>

                </div>
                <div>
                  <div class="text-muted small">{{ $t('city') }}</div>
                  <div class="font-weight-bold">{{ profileData?.profileDetails?.city || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>

                </div>
                <div>
                  <div class="text-muted small">{{ $t('state') }}</div>
                  <div class="font-weight-bold">{{ profileData?.profileDetails?.state_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-lg-12">
      <div class="card card-block card-stretch card-height shadow-sm border-0">
        <div class="card-body p-4">
          <!-- Header -->
          <div class="d-flex align-items-center justify-content-between mb-4">
            <div class="d-flex align-items-center">
              <div class="p-icon mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="text-primary" width="24" height="24" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 01-2-2H7a2 2 0 01-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 class="card-title mb-0 font-weight-bold">{{ $t('company_details') }}</h4>
            </div>
            <div v-if="businessDetails?.business_logo_url" class="text-right">
              <img :src="businessDetails.business_logo_url" alt="Business Logo" class="rounded border"
                style="max-height: 48px; max-width: 120px; object-fit: contain;">
            </div>
          </div>

          <!-- Business Info Grid -->
          <div class="row">
            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>

                </div>
                <div>
                  <div class="text-muted small">{{ $t('business_name') }}</div>
                  <div class="font-weight-bold">{{ businessDetails?.business_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>

                </div>
                <div>
                  <div class="text-muted small">{{ $t('website') }}</div>
                  <div class="font-weight-bold"><a v-if="businessDetails?.website" :href="businessDetails.website"
                      target="_blank" class="text-primary">{{ businessDetails.website }}</a><span v-else>N/A</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>

                </div>
                <div>
                  <div class="text-muted small">{{ $t('address') }}</div>
                  <div class="font-weight-bold">{{ businessDetails?.address || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg></div>
                <div>
                  <div class="text-muted small">{{ $t('city') }}</div>
                  <div class="font-weight-bold">{{ businessDetails?.city || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <div>
                  <div class="text-muted small">{{ $t('state') }}</div>
                  <div class="font-weight-bold">{{ businessDetails?.state_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                  </svg>
                </div>
                <div>
                  <div class="text-muted small">{{ $t('country') }}</div>
                  <div class="font-weight-bold">{{ businessDetails?.country_name || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div>
                  <div class="text-muted small">{{ $t('timezone') }}</div>
                  <div class="font-weight-bold">{{ businessDetails?.timezone_name || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <!-- Status Badges Row -->
            <div class="col-12 mt-2">
              <div class="d-flex flex-wrap align-items-center gap-2">
                <div class="mr-3">
                  <span class="text-muted small d-block mb-1">{{ $t('account_type') }}</span>
                  <span class="badge badge-primary px-3 py-1">{{ businessDetails?.account_type_name || 'N/A' }}</span>
                </div>
                <div class="mr-3">
                  <span class="text-muted small d-block mb-1">{{ $t('service_type') }}</span>
                  <span class="badge badge-secondary px-3 py-1">{{ businessDetails?.service_type_name || 'N/A' }}</span>
                </div>
                <div class="mr-3">
                  <span class="text-muted small d-block mb-1">{{ $t('status') }}</span>
                  <span class="badge badge-success px-3 py-1">{{ businessDetails?.status_name || 'N/A' }}</span>
                </div>
                <div class="mr-3">
                  <span class="text-muted small d-block mb-1">{{ $t('active_package') }}</span>
                  <span class="badge badge-info px-3 py-1">{{ businessDetails?.subscription?.package?.name || 'N/A'
                    }}</span>
                </div>
              </div>
            </div>

            <!-- Categories -->
            <div class="col-12 mt-3" v-if="businessDetails?.categories?.length">
              <div class="text-muted small mb-2">{{ $t('company_category') }}</div>
              <div>
                <span v-for="cat in businessDetails.categories" :key="cat.id"
                  class="badge badge-pill badge-light text-dark border mr-2 mb-1 px-3 py-1">{{ cat.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import defaultProfilePic from '../../assets/images/profile.png'

const props = defineProps({
  profileData: Object
})

const profileImage = computed(() => props.profileData?.profileDetails?.profile_pic)

const businessDetails = computed(() => {
  const businesses = props.profileData?.profileDetails?.businesses || []
  const authCompanyId = props.profileData?.profileDetails?.company?.id
  return businesses.find(b => b.id === authCompanyId) || businesses[0] || null
})
</script>
