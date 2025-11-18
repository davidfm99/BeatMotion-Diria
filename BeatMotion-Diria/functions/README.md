# Deploy functions into google functions

1. navigate into cmd to the functions directory

2. in the root

```bash
  npm run build
```

This will create content into /lib

3. Run the following command to deploy all fucntions

```bash
  firebase deploy --only functions
```

- To deploy a specific function run following:

```bash
   firebase deploy --only functions:<NameOfFunction>
```


- To look a logs in CMD propmt


```bash
  firebase functions:log
```
```bash
  firebase functions:log --only sendExpoPushNotification
```
