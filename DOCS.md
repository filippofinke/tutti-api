## Modules

<dl>
<dt><a href="#module_account">account</a></dt>
<dd></dd>
<dt><a href="#module_subscriptions">subscriptions</a></dt>
<dd></dd>
<dt><a href="#module_config">config</a></dt>
<dd></dd>
<dt><a href="#module_image_upload">image_upload</a></dt>
<dd></dd>
</dl>

<a name="module_account"></a>

## account

* [account](#module_account)
    * [~login(email, password, remember)](#module_account..login) ⇒ <code>Promise</code>
    * [~register(email, password)](#module_account..register) ⇒ <code>Promise</code>
    * [~logout()](#module_account..logout)
    * [~delete(password)](#module_account..delete) ⇒ <code>Promise</code>
    * [~getPaywall()](#module_account..getPaywall) ⇒ <code>Promise</code>
    * [~getSubscription()](#module_account..getSubscription) ⇒ <code>Promise</code>
    * [~getFavorites()](#module_account..getFavorites) ⇒ <code>Promise</code>
    * [~getProfile()](#module_account..getProfile) ⇒ <code>Promise</code>
    * [~getItems([page])](#module_account..getItems) ⇒ <code>Promise</code>
    * [~getPendingItems([page])](#module_account..getPendingItems) ⇒ <code>Promise</code>
    * [~getItemsToModify([page])](#module_account..getItemsToModify) ⇒ <code>Promise</code>
    * [~getDisabledItems([page])](#module_account..getDisabledItems) ⇒ <code>Promise</code>
    * [~getArchivedItems([page])](#module_account..getArchivedItems) ⇒ <code>Promise</code>

<a name="module_account..login"></a>

### account~login(email, password, remember) ⇒ <code>Promise</code>
Login to an existing account.

**Kind**: inner method of [<code>account</code>](#module_account)  
**Returns**: <code>Promise</code> - The status of the login.  

| Param | Type | Description |
| --- | --- | --- |
| email | <code>string</code> | The email. |
| password | <code>string</code> | The password. |
| remember | <code>boolean</code> | If the session must be saved. |

<a name="module_account..register"></a>

### account~register(email, password) ⇒ <code>Promise</code>
Register a new account.

**Kind**: inner method of [<code>account</code>](#module_account)  
**Returns**: <code>Promise</code> - The status of the registration.  

| Param | Type | Description |
| --- | --- | --- |
| email | <code>string</code> | The email. |
| password | <code>string</code> | The password. |

<a name="module_account..logout"></a>

### account~logout()
Logout from the current account.

**Kind**: inner method of [<code>account</code>](#module_account)  
<a name="module_account..delete"></a>

### account~delete(password) ⇒ <code>Promise</code>
Delete the current account.

**Kind**: inner method of [<code>account</code>](#module_account)  
**Returns**: <code>Promise</code> - The status of the deletion.  

| Param | Type | Description |
| --- | --- | --- |
| password | <code>string</code> | The password. |

<a name="module_account..getPaywall"></a>

### account~getPaywall() ⇒ <code>Promise</code>
Get the current pay wall.

**Kind**: inner method of [<code>account</code>](#module_account)  
**Returns**: <code>Promise</code> - The pay wall.  
<a name="module_account..getSubscription"></a>

### account~getSubscription() ⇒ <code>Promise</code>
Get the current subscriptions.

**Kind**: inner method of [<code>account</code>](#module_account)  
**Returns**: <code>Promise</code> - The subscriptions.  
<a name="module_account..getFavorites"></a>

### account~getFavorites() ⇒ <code>Promise</code>
Get the favorites.

**Kind**: inner method of [<code>account</code>](#module_account)  
**Returns**: <code>Promise</code> - The favorites.  
<a name="module_account..getProfile"></a>

### account~getProfile() ⇒ <code>Promise</code>
Get the current profile.

**Kind**: inner method of [<code>account</code>](#module_account)  
**Returns**: <code>Promise</code> - The current profile.  
<a name="module_account..getItems"></a>

### account~getItems([page]) ⇒ <code>Promise</code>
Get the user posts.

**Kind**: inner method of [<code>account</code>](#module_account)  
**Returns**: <code>Promise</code> - The posts.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [page] | <code>number</code> | <code>1</code> | The page. |

<a name="module_account..getPendingItems"></a>

### account~getPendingItems([page]) ⇒ <code>Promise</code>
Get the user pending verification posts.

**Kind**: inner method of [<code>account</code>](#module_account)  
**Returns**: <code>Promise</code> - The posts.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [page] | <code>number</code> | <code>1</code> | The page. |

<a name="module_account..getItemsToModify"></a>

### account~getItemsToModify([page]) ⇒ <code>Promise</code>
Get the user posts pending modification.

**Kind**: inner method of [<code>account</code>](#module_account)  
**Returns**: <code>Promise</code> - The posts.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [page] | <code>number</code> | <code>1</code> | The page. |

<a name="module_account..getDisabledItems"></a>

### account~getDisabledItems([page]) ⇒ <code>Promise</code>
Get the user disabled posts.

**Kind**: inner method of [<code>account</code>](#module_account)  
**Returns**: <code>Promise</code> - The posts.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [page] | <code>number</code> | <code>1</code> | The page. |

<a name="module_account..getArchivedItems"></a>

### account~getArchivedItems([page]) ⇒ <code>Promise</code>
Get the user archived posts.

**Kind**: inner method of [<code>account</code>](#module_account)  
**Returns**: <code>Promise</code> - The posts.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [page] | <code>number</code> | <code>1</code> | The page. |

<a name="module_subscriptions"></a>

## subscriptions

* [subscriptions](#module_subscriptions)
    * [~getAvailableBumps()](#module_subscriptions..getAvailableBumps) ⇒ <code>Promise</code>
    * [~getPlans()](#module_subscriptions..getPlans) ⇒ <code>Promise</code>

<a name="module_subscriptions..getAvailableBumps"></a>

### subscriptions~getAvailableBumps() ⇒ <code>Promise</code>
Get the available bumps.

**Kind**: inner method of [<code>subscriptions</code>](#module_subscriptions)  
**Returns**: <code>Promise</code> - The available bumps.  
<a name="module_subscriptions..getPlans"></a>

### subscriptions~getPlans() ⇒ <code>Promise</code>
Get the current plans.

**Kind**: inner method of [<code>subscriptions</code>](#module_subscriptions)  
**Returns**: <code>Promise</code> - The available plans.  
<a name="module_config"></a>

## config
<a name="module_config..getSubCategories"></a>

### config~getSubCategories() ⇒ <code>Promise</code>
Get the available categories.

**Kind**: inner method of [<code>config</code>](#module_config)  
**Returns**: <code>Promise</code> - The available categories.  
<a name="module_image_upload"></a>

## image\_upload
<a name="module_image_upload..uploadImage"></a>

### image_upload~uploadImage(path) ⇒ <code>Promise</code>
Upload an image.

**Kind**: inner method of [<code>image\_upload</code>](#module_image_upload)  
**Returns**: <code>Promise</code> - The status of the upload.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The image path. |

