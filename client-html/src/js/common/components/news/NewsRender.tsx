/*
 * Copyright ish group pty ltd 2021.
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
 *
 *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 */

import React, { useEffect, useState } from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import CloseIcon from "@material-ui/icons/Close";
import withStyles from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import Typography from "@material-ui/core/Typography";
import { fade } from "@material-ui/core/styles/colorManipulator";
import clsx from "clsx";
import ListItemText from "@material-ui/core/ListItemText";
import Box from "@material-ui/core/Box";
import { format as formatDate } from "date-fns";
import ListItem from "@material-ui/core/ListItem";
import { State } from "../../../reducers/state";
import { AppTheme } from "../../../model/common/Theme";
import { D_MMM_YYYY } from "../../utils/dates/format";
import {
  DASHBOARD_NEWS_LATEST_READ,
  READED_NEWS
} from "../../../constants/Config";
import { setUserPreference } from "../../actions";

const styles = (theme: AppTheme) => createStyles({
  postsWrapper: {
    padding: theme.spacing(3),
  },
  postWrapper: {
    background: theme.palette.background.paper,
    position: "relative",
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    border: "2px solid",
    borderColor: fade(theme.palette.text.disabled, 0.1),
    "&:not(:last-child)": {
      marginBottom: theme.spacing(2),
    },
  },
  closeIcon: {
    position: "absolute",
    top: "-15px",
    right: "-15px",
    borderRadius: "50%",
    padding: theme.spacing(0.5),
    background: theme.palette.background.paper,
    border: "2px solid",
    color: fade(theme.palette.text.disabled, 0.3),
    borderColor: fade(theme.palette.text.disabled, 0.1),
    width: "30px",
    height: "30px",
    "&:hover": {
      cursor: "pointer",
      color: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
    },
  },
  postContentExpanded: {
    maxHeight: "none",
    paddingBottom: 20,
    "&::after": {
      content: "none",
    }
  },
});

const NewsItemRender = props => {
  const { classes, latestReadDate, post, setReadedNews } = props;

  const isLatestItem = latestReadDate === "" || new Date(latestReadDate).getTime() < new Date(post.published).getTime();

  const setIdOfReadedNews = () => {
    setReadedNews(post.id);
  };

  return (
    <ListItem
      id={`post-${post.id}`}
      alignItems="flex-start"
      className={classes.postWrapper}
    >
      <div className="w-100 d-block">
        {isLatestItem && (
          <Typography
            component="span"
            variant="caption"
            className={clsx("errorDarkBackgroundColor errorContrastColor boldText relative left-0 text-uppercase", classes.newCaption)}
          >
            NEW
          </Typography>
        )}
        <ListItemText
          primary={(
            <Typography component="span" variant="body1" className="text-bold heading">
              {post.title}
            </Typography>
          )}
          secondary={(
            <Box component="span" display="block" mt={1}>
              <Box component="span" display="block" position="relative">
                <Typography
                  component="span"
                  variant="body2"
                  color="textPrimary"
                  className={clsx(
                    "blog-post-content d-block overflow-hidden", classes.postContentExpanded
                  )}
                >
                  <Box component="span" display="block" dangerouslySetInnerHTML={{ __html: post.content }} />
                </Typography>
                {" "}
              </Box>
              <Box component="span" display="block" fontStyle="italic" textAlign="left">
                <Typography
                  component="span"
                  variant="caption"
                  color="textSecondary"
                  className="mt-1 d-block"
                >
                  {`Posted ${post.published && formatDate(new Date(post.published), D_MMM_YYYY)}`}
                </Typography>
              </Box>
            </Box>
          )}
        />
      </div>
      <CloseIcon className={classes.closeIcon} onClick={setIdOfReadedNews} />
    </ListItem>
  );
};

const NewsRender = props => {
  const {
    blogPosts, classes, page, preferences, setReadedNews
  } = props;

  const [postsForRender, setPostsForRender] = useState([]);

  useEffect(() => {
    const readedNews = preferences[READED_NEWS] && preferences[READED_NEWS].split(",");

    setPostsForRender(blogPosts.filter(post => ((!post.page && !page) || post.page === page)
      && (!readedNews || !readedNews.includes(post.id))));
  }, [blogPosts, page, preferences]);

  return postsForRender.length ? (
    <div className={classes.postsWrapper}>
      {postsForRender.map(post => (
        <NewsItemRender
          key={post.id}
          post={post}
          classes={classes}
          latestReadDate={preferences[DASHBOARD_NEWS_LATEST_READ]}
          setReadedNews={setReadedNews}
        />
      ))}
    </div>
  ) : null;
};

const mapStateToProps = (state: State) => ({
  blogPosts: state.dashboard.blogPosts,
  preferences: state.userPreferences,
});

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  setReadedNews: (newsId: string) => dispatch(setUserPreference({ key: READED_NEWS, value: newsId })),
});

export default connect<any, any, any>(mapStateToProps, mapDispatchToProps)(withStyles(styles)(NewsRender));