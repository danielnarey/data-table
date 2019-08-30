```
/**
 * % EXPOSED by MODULE as default, PACKAGE as sample
 * # Returns a data table containing a random sample of *n* observations
 * # from *dt*
 * @dt ^Map:DataTable -> `awaits Map [more precisely: DataTable]`
 * @n ^Number:Int<1> -> `awaits Number [more precisely: Int (n >= 1)]`
 * @@ ^Map:DataTable -> `rejects or resolves to Map [more precisely: DataTable]`
 */
```
 
### sample(dt, n)

Returns a data table containing a random sample of *n* observations from *dt*

- **`dt`** awaits `Map` [more precisely: `DataTable`]
- **`n`** awaits `Number` [more precisely: `Int` (n >= 1)]
- **`=>`** rejects or resolves to `Map` [more precisely: `DataTable`]
 
