import { computed, inject } from '@angular/core';
import { patchState, signalStore, type, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  addEntities,
  entityConfig,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { filter, from, pipe, switchMap, tap } from 'rxjs';
import { PrayerRequestService } from '../services/prayer-request.service';
import { PrayerRequest } from '../models/prayer.model';
import { PAGE_SIZE } from '../prayer-requests.constants';

const requestConfig = entityConfig({
  entity: type<PrayerRequest>(),
  collection: '_request',
});

export const PrayerRequestsStore = signalStore(
  { providedIn: 'root' },
  withEntities(requestConfig),
  withState({
    loading: false,
    _cursor: null as string | null,
    hasMore: true,
    error: null as unknown,
  }),
  withMethods((store, service = inject(PrayerRequestService)) => {
    const getCursor = (data: PrayerRequest[]) =>
      data.length > 0 ? data[data.length - 1].created_at : null;

    return {
      loadInitial: rxMethod<void>(
        pipe(
          tap(() =>
            patchState(store, setAllEntities([] as PrayerRequest[], requestConfig), {
              loading: true,
              _cursor: null,
              hasMore: true,
              error: null,
            }),
          ),
          switchMap(() =>
            from(service.getPage()).pipe(
              tapResponse({
                next: (data) =>
                  patchState(store, addEntities(data, requestConfig), {
                    _cursor: getCursor(data),
                    hasMore: data.length === PAGE_SIZE,
                    loading: false,
                  }),
                error: (err) => patchState(store, { error: err, loading: false }),
              }),
            ),
          ),
        ),
      ),

      loadMore: rxMethod<void>(
        pipe(
          filter(() => !store.loading() && store.hasMore()),
          tap(() => patchState(store, { loading: true })),
          switchMap(() =>
            from(service.getPage(store._cursor() ?? undefined)).pipe(
              tapResponse({
                next: (data) =>
                  patchState(store, addEntities(data, requestConfig), {
                    _cursor: getCursor(data),
                    hasMore: data.length === PAGE_SIZE,
                    loading: false,
                  }),
                error: (err) => patchState(store, { error: err, loading: false }),
              }),
            ),
          ),
        ),
      ),

      removeRequest: (id: string) => patchState(store, removeEntity(id, requestConfig)),

      updateRequest: (id: string, patch: Partial<PrayerRequest>) =>
        patchState(store, updateEntity({ id, changes: patch }, requestConfig)),
    };
  }),
  withComputed(({ _requestEntities }) => ({
    prayerRequests: _requestEntities,
    hasPrayerRequests: computed(() => _requestEntities().length > 0),
  })),
);
