'use client';

import type { ActionTab } from '@/lib/capabilities';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './molecules.module.css';

type Props = {
  tabs: ActionTab[];
  activeTab: ActionTab;
  onChange: (tab: ActionTab) => void;
  panelId: string;
};

export function ActionTabs({ tabs, activeTab, onChange, panelId }: Props) {
  const { messages } = useI18n();

  return (
    <div className={styles.tabs} role="tablist" aria-label={messages.sections.documentActions}>
      {tabs.map((tab) => {
        const selected = tab === activeTab;
        const tabId = `${panelId}-tab-${tab}`;
        return (
          <button
            key={tab}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${panelId}-panel-${tab}`}
            className={`${styles.tab} ${selected ? styles.tabActive : ''}`.trim()}
            onClick={() => {
              onChange(tab);
            }}
          >
            {messages.tabs[tab]}
          </button>
        );
      })}
    </div>
  );
}
