<template>
  <q-page class="row">
    <div class="table-wrap">
      <q-table
        title="휴일 약국 정보"
        :rows="mapData"           
        :columns="columns"
        row-key="name"
        :pagination="pagination"
    />

    </div>
    <div class="map-wrap">
      map
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

const columns = [
  {
    name: 'name',
    required: true,
    label: '약국명',
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
  },
  { name: 'addr', align: 'left', label: '주소', field: 'addr',},
  { name: 'open', label: '운영시간', field: 'open'},
  { name: 'likeCount', label: '좋아요', field: 'likeCount'}
]

import { useMapStore } from 'src/stores/map'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'IndexPage',
  setup() {
    
    const $map = useMapStore()

    $map.loadMapData()

    const { mapData } = storeToRefs($map)
    const pagination = {
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 10
    }

    return {
      columns, 
      mapData,
      pagination
    }
  }
})
</script>
<style lang="scss" scoped>
.table-wrap {
  width: 50vw;
}
</style>
