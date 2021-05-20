/*
 * Copyright ish group pty ltd 2021.
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License version 3 as published by the Free Software Foundation.
 *
 *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 */

import { combineEpics } from "redux-observable";
import { EpicCreateTokens } from "./EpicCreateTokens";
import { EpicDeleteToken } from "./EpicDeleteToken";
import { EpicGetApiTokens } from "./EpicGetApiTokens";

export const EpicApiTokens = combineEpics(EpicCreateTokens, EpicDeleteToken, EpicGetApiTokens);
