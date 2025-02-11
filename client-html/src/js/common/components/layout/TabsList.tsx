/*
 * Copyright ish group pty ltd. All rights reserved. https://www.ish.com.au
 * No copying or use of this code is allowed without permission in writing from ish.
 */

import React, {
 useEffect, useRef, useState
} from "react";
import Grid, { GridSize } from "@mui/material/Grid";
import clsx from "clsx";
import { RouteComponentProps, withRouter } from "react-router";
import NewsRender from "../news/NewsRender";
import { APP_BAR_HEIGHT, TAB_LIST_SCROLL_TARGET_ID } from "../../../constants/Config";
import { LSGetItem, LSSetItem } from "../../utils/storage";
import { EditViewProps } from "../../../model/common/ListView";
import { useStickyScrollSpy } from "../../utils/hooks";
import { makeAppStyles } from "../../styles/makeStyles";
import SideBarHeader from "./side-bar-list/SideBarHeader";

const useStyles = makeAppStyles(theme => ({
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    flexDirection: "column",
    backgroundColor: theme.tabList.listContainer.backgroundColor,
    padding: theme.spacing(4)
  },
  listContainerInner: {
    marginBottom: theme.spacing(8),
    color: theme.tabList.listItemRoot.color
  },
  indicator: {
    display: "none"
  }
}));

export interface TabsListItem {
  readonly type?: string;
  component: (props: any) => React.ReactNode;
  labelAdornment?: React.ReactNode;
  expandable?: boolean;
  label: string;
}

interface Props {
  classes?: any;
  itemProps?: EditViewProps & any;
  items: TabsListItem[];
  newsOffset?: string;
}

const TABLIST_LOCAL_STORAGE_KEY = "localstorage_key_tab_list";

const getLayoutArray = (twoColumn: boolean): { [key: string]: GridSize }[] => (twoColumn ? [{ xs: 10 }, { xs: 2 }] : [{ xs: 12 }, { xs: "auto" }]);

const TabsList = React.memo<Props & RouteComponentProps>((
  {
    items, 
    itemProps = {},
    history, 
    location,
    newsOffset
  }
) => {
  const { scrollSpy } = useStickyScrollSpy();
  const classes = useStyles();

  const scrolledPX = useRef<number>(0);
  const scrollNodes = useRef<HTMLElement[]>([]);
  const scrollContainer = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<string>(null);
  const [expanded, setExpanded] = useState<number[]>([]);

  const scrollToSelected = (i: TabsListItem, index) => {
    setSelected(i.label);
    
    const item = scrollNodes.current.find(sn => sn.id === i.label);

    scrollContainer.current.scrollTo({
      top: item.offsetTop - APP_BAR_HEIGHT,
      behavior: 'smooth'
    });

    if (i.expandable && !expanded.includes(index)) {
      setTimeout(() => {
        setExpanded([...expanded, index]);
      }, 300);
    }
  };

  useEffect(() => {
    const stored = JSON.parse(LSGetItem(TABLIST_LOCAL_STORAGE_KEY));
    if (stored && stored[itemProps.rootEntity]) {
      setExpanded(stored[itemProps.rootEntity]);
    }
  }, []);

  useEffect(() => {
    if (!selected && items.length) {
      setSelected(items[0].label);
    }
  }, [items.length, selected]);

  useEffect(() => {
    const stored = JSON.parse(LSGetItem(TABLIST_LOCAL_STORAGE_KEY));
    let updated = {};
    if (stored) {
      updated = { ...stored };
    }
    updated[itemProps.rootEntity] = expanded;
    LSSetItem(TABLIST_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }, [expanded, itemProps.rootEntity]);

  useEffect(() => {
    if (location.search) {
      const search = new URLSearchParams(location.search);
      const expandTab = Number(search.get("expandTab"));

      if (search.has("expandTab") && !isNaN(expandTab)) {
        setTimeout(() => {
          scrollToSelected(items[expandTab], expandTab);
          search.delete("expandTab");

          const updatedSearch = decodeURIComponent(search.toString());

          history.replace({
            pathname: location.pathname,
            search: updatedSearch ? `?${updatedSearch}` : ""
          });
        }, 300);
      }
    }
  }, [location.search]);

  useEffect(() => {
    scrollNodes.current = scrollNodes.current.slice(0, items.length);
  }, [items]);

  const onScroll = e => {
    if (!itemProps.twoColumn) {
      return;
    }

    scrollSpy(e);

    if (e.target.id !== TAB_LIST_SCROLL_TARGET_ID) {
      return;
    }

    const isScrollingDown = scrolledPX.current < e.target.scrollTop;

    scrolledPX.current = e.target.scrollTop;

    // scrolled to bottom
    if (e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight) {
      setSelected(scrollNodes.current[scrollNodes.current.length - 1].id);
      return;
    }

    const selectedIndex = scrollNodes.current.findIndex(sn => sn.id === selected);

    if (
      isScrollingDown
      && scrollNodes.current[selectedIndex]
      && e.target.scrollTop
        >= scrollNodes.current[selectedIndex].offsetHeight + scrollNodes.current[selectedIndex].offsetTop - APP_BAR_HEIGHT
    ) {
      if (selectedIndex + 1 <= scrollNodes.current.length - 1) {
        setSelected(scrollNodes.current[selectedIndex + 1].id);
      }
      return;
    }

    if (!isScrollingDown && scrollNodes.current[selectedIndex] && e.target.scrollTop < scrollNodes.current[selectedIndex].offsetTop - APP_BAR_HEIGHT) {
      if (selectedIndex - 1 >= 0) {
        setSelected(scrollNodes.current[selectedIndex - 1].id);
      }
    }
  };

  const layoutArray = getLayoutArray(itemProps.twoColumn);

  return (
    <Grid container className={clsx("overflow-hidden", itemProps.twoColumn ? "h-100" : "fullHeightWithoutAppBar")}>
      <Grid
        item
        xs={layoutArray[0].xs}
        className="overflow-y-auto overflow-x-hidden h-100"
        onScroll={onScroll}
        id={TAB_LIST_SCROLL_TARGET_ID}
        ref={scrollContainer}
      >
        <NewsRender newsOffset={newsOffset} page className="p-3" />
        {items.map((i, tabIndex) => (
          <div
            id={i.label}
            key={tabIndex}
            ref={el => scrollNodes.current[tabIndex] = el}
            className={tabIndex === items.length - 1 ? "saveButtonTableOffset" : undefined}
          >
            {i.component({
              ...itemProps, expanded, setExpanded, tabIndex
            })}
          </div>
        ))}
      </Grid>
      {itemProps.twoColumn && (
        <Grid item xs={layoutArray[1].xs} className="root">
          <div className={classes.listContainer}>
            <div className={classes.listContainerInner}>
              {items.map((i, index) => (
                <SideBarHeader
                  label={i.label}
                  labelAdornment={i.labelAdornment}
                  selected={i.label === selected}
                  onClick={() => scrollToSelected(i, index)}
                  key={index}
                />
              ))}
            </div>
          </div>
        </Grid>
      )}
    </Grid>
  );
});

export default withRouter(TabsList);