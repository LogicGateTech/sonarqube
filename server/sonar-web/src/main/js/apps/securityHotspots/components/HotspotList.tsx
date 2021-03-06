/*
 * SonarQube
 * Copyright (C) 2009-2020 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as classNames from 'classnames';
import { groupBy } from 'lodash';
import * as React from 'react';
import ListFooter from 'sonar-ui-common/components/controls/ListFooter';
import SecurityHotspotIcon from 'sonar-ui-common/components/icons/SecurityHotspotIcon';
import { translate, translateWithParameters } from 'sonar-ui-common/helpers/l10n';
import { HotspotStatusFilter, RawHotspot, RiskExposure } from '../../../types/security-hotspots';
import { groupByCategory, RISK_EXPOSURE_LEVELS } from '../utils';
import HotspotCategory from './HotspotCategory';
import './HotspotList.css';

export interface HotspotListProps {
  hotspots: RawHotspot[];
  hotspotsTotal?: number;
  isStaticListOfHotspots: boolean;
  loadingMore: boolean;
  onHotspotClick: (key: string) => void;
  onLoadMore: () => void;
  securityCategories: T.StandardSecurityCategories;
  selectedHotspotKey: string | undefined;
  statusFilter: HotspotStatusFilter;
}

export default function HotspotList(props: HotspotListProps) {
  const {
    hotspots,
    hotspotsTotal,
    isStaticListOfHotspots,
    loadingMore,
    securityCategories,
    selectedHotspotKey,
    statusFilter
  } = props;

  const groupedHotspots: Array<{
    risk: RiskExposure;
    categories: Array<{ key: string; hotspots: RawHotspot[]; title: string }>;
  }> = React.useMemo(() => {
    const risks = groupBy(hotspots, h => h.vulnerabilityProbability);

    return RISK_EXPOSURE_LEVELS.map(risk => ({
      risk,
      categories: groupByCategory(risks[risk], securityCategories)
    })).filter(risk => risk.categories.length > 0);
  }, [hotspots, securityCategories]);

  return (
    <div className="huge-spacer-bottom">
      <h1 className="hotspot-list-header bordered-bottom">
        <SecurityHotspotIcon className="spacer-right" />
        {translateWithParameters(
          isStaticListOfHotspots ? 'hotspots.list_title' : `hotspots.list_title.${statusFilter}`,
          hotspots.length
        )}
      </h1>
      <ul className="big-spacer-bottom">
        {groupedHotspots.map((riskGroup, groupIndex) => (
          <li className="big-spacer-bottom" key={riskGroup.risk}>
            <div className="hotspot-risk-header little-spacer-left">
              <span>{translate('hotspots.risk_exposure')}</span>
              <div className={classNames('hotspot-risk-badge', 'spacer-left', riskGroup.risk)}>
                {translate('risk_exposure', riskGroup.risk)}
              </div>
            </div>
            <ul>
              {riskGroup.categories.map((cat, catIndex) => (
                <li className="spacer-bottom" key={cat.key}>
                  <HotspotCategory
                    hotspots={cat.hotspots}
                    onHotspotClick={props.onHotspotClick}
                    selectedHotspotKey={selectedHotspotKey}
                    startsExpanded={groupIndex === 0 && catIndex === 0}
                    title={cat.title}
                  />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <ListFooter
        count={hotspots.length}
        loadMore={!loadingMore ? props.onLoadMore : undefined}
        loading={loadingMore}
        total={hotspotsTotal}
      />
    </div>
  );
}
