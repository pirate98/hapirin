package com.hapirin

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.provider.Settings

object NetWorkUtils {
    const val REQUEST_CODE_CONNECTION_NETWORK = 1000

    @JvmStatic
    fun isNetworkAvailable(context: Context): Boolean {
        val connectivityManager =
            context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val activeNetworkInfo = connectivityManager.activeNetworkInfo

        return activeNetworkInfo?.isConnected == true
    }

    @JvmStatic
    fun gotoConnectionSettings(activity: Activity) {
        val intent = Intent(Settings.ACTION_WIFI_SETTINGS)
        activity.startActivityForResult(intent, REQUEST_CODE_CONNECTION_NETWORK)
    }
}