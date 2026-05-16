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
          <div class="d-flex align-items-center mb-4">
            <div class="p-icon mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="text-primary" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h4 class="card-title mb-0 font-weight-bold">{{ $t('about_me') }}</h4>
          </div>

          <!-- Personal Details Grid -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-venus-mars fa-lg"></i></div>
                <div>
                  <div class="text-muted small">{{ $t('gender') }}</div>
                  <div class="font-weight-bold">{{ profileData?.profileDetails?.gender === 0 ? 'Male' : 'Female' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-language fa-lg"></i></div>
                <div>
                  <div class="text-muted small">{{ $t('language') }}</div>
                  <div class="font-weight-bold">{{ profileData?.profileDetails?.language_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-clock fa-lg"></i></div>
                <div>
                  <div class="text-muted small">{{ $t('timezone') }}</div>
                  <div class="font-weight-bold">{{ profileData?.profileDetails?.timezone_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-globe-americas fa-lg"></i></div>
                <div>
                  <div class="text-muted small">{{ $t('country') }}</div>
                  <div class="font-weight-bold">{{ profileData?.profileDetails?.country_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-city fa-lg"></i></div>
                <div>
                  <div class="text-muted small">{{ $t('city') }}</div>
                  <div class="font-weight-bold">{{ profileData?.profileDetails?.city || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-map fa-lg"></i></div>
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
                <svg xmlns="http://www.w3.org/2000/svg" class="text-primary" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 01-2-2H7a2 2 0 01-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 class="card-title mb-0 font-weight-bold">{{ $t('company_details') }}</h4>
            </div>
            <div v-if="businessDetails?.business_logo_url" class="text-right">
              <img :src="businessDetails.business_logo_url" alt="Business Logo" class="rounded border" style="max-height: 48px; max-width: 120px; object-fit: contain;">
            </div>
          </div>

          <!-- Business Info Grid -->
          <div class="row">
            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-building fa-lg"></i></div>
                <div>
                  <div class="text-muted small">{{ $t('business_name') }}</div>
                  <div class="font-weight-bold">{{ businessDetails?.business_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-globe fa-lg"></i></div>
                <div>
                  <div class="text-muted small">{{ $t('website') }}</div>
                  <div class="font-weight-bold"><a v-if="businessDetails?.website" :href="businessDetails.website" target="_blank" class="text-primary">{{ businessDetails.website }}</a><span v-else>N/A</span></div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-map-marker-alt fa-lg"></i></div>
                <div>
                  <div class="text-muted small">{{ $t('address') }}</div>
                  <div class="font-weight-bold">{{ businessDetails?.address || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-city fa-lg"></i></div>
                <div>
                  <div class="text-muted small">{{ $t('city') }}</div>
                  <div class="font-weight-bold">{{ businessDetails?.city || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-map fa-lg"></i></div>
                <div>
                  <div class="text-muted small">{{ $t('state') }}</div>
                  <div class="font-weight-bold">{{ businessDetails?.state_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-globe-americas fa-lg"></i></div>
                <div>
                  <div class="text-muted small">{{ $t('country') }}</div>
                  <div class="font-weight-bold">{{ businessDetails?.country_name || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <div class="col-md-6 col-lg-4 mb-3">
              <div class="d-flex align-items-start">
                <div class="p-icon mr-3 text-primary"><i class="fas fa-clock fa-lg"></i></div>
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
                  <span class="badge badge-info px-3 py-1">{{ businessDetails?.subscription?.package?.name || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <!-- Categories -->
            <div class="col-12 mt-3" v-if="businessDetails?.categories?.length">
              <div class="text-muted small mb-2">{{ $t('company_category') }}</div>
              <div>
                <span v-for="cat in businessDetails.categories" :key="cat.id" class="badge badge-pill badge-light text-dark border mr-2 mb-1 px-3 py-1">{{ cat.name }}</span>
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
