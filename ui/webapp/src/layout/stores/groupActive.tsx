import { useNavigate, useSearchParams } from '@solidjs/router';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import { createContext, createSignal, ParentComponent, useContext } from 'solid-js';

import { ALL_OPTION, BASE_PATH, GROUP_PARAM } from '../../data';
import { Group } from '../../types';
import isExploreSection from '../../utils/isExploreSection';
import prepareLink from '../../utils/prepareLink';

const getInitialGroupName = (groupParam: string | null): string | undefined => {
  const navigate = useNavigate();

  if (isUndefined(window.baseDS.groups)) {
    return undefined;
  } else {
    const firstGroup = window.baseDS.groups[0].normalized_name;
    if (isNull(groupParam)) {
      return firstGroup;
    } else {
      const selectedGroup = window.baseDS.groups.find((group: Group) => group.normalized_name === groupParam);
      if (!isUndefined(selectedGroup) || groupParam === ALL_OPTION) {
        return groupParam;
      } else {
        if (isExploreSection(location.pathname)) {
          navigate(prepareLink(BASE_PATH, `group=${firstGroup}`), {
            replace: true,
          });
        }
        return firstGroup;
      }
    }
  }
};

function useGroupActiveProvider() {
  const [searchParams] = useSearchParams();
  const [group, setGroup] = createSignal<string | undefined>(getInitialGroupName(searchParams[GROUP_PARAM] || null));
  return { group: group, setGroup: setGroup };
}

export type ContextGroupActiveType = ReturnType<typeof useGroupActiveProvider>;

const GroupActiveContext = createContext<ContextGroupActiveType | undefined>(undefined);

export const GroupActiveProvider: ParentComponent = (props) => {
  const value = useGroupActiveProvider();
  return <GroupActiveContext.Provider value={value}>{props.children}</GroupActiveContext.Provider>;
};

export function useGroupA() {
  const context = useContext(GroupActiveContext);
  if (context === undefined) {
    throw new Error(`useGroupA must be used within a GroupActiveProvider`);
  }
  return context;
}

export function useGroupActive() {
  return useGroupA().group || 'default';
}

export function useSetGroupActive() {
  return useGroupA().setGroup;
}
