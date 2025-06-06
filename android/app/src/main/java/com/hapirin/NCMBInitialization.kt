package com.hapirin

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.*
import com.google.firebase.messaging.FirebaseMessaging
import com.nifcloud.mbaas.core.NCMB
import com.nifcloud.mbaas.core.NCMBException
import com.nifcloud.mbaas.core.NCMBInstallation
import com.nifcloud.mbaas.core.NCMBQuery
import org.json.JSONArray

class NCMBInitialization(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    ActivityEventListener {

    private var currentActivity: Activity? = null
    private var noConnectionDialog: AlertDialog? = null
    private var mPromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "NCMBInitialization"

    @ReactMethod
    private fun goConnectionSettings(promise: Promise) {
        currentActivity = currentActivity ?: currentActivity
        currentActivity?.let {
            mPromise = promise
            NetWorkUtils.gotoConnectionSettings(it)
        }
    }

    @ReactMethod
    private fun initConfigNCMB(userId: String) {
        val activity = currentActivity ?: return

        val appKey = "2f33e87372a1143f25394bec0e85ee81f1131ebcf73ebb49132ece93705922ba"
        val clientKey = "ec545647beba0e75e3f5a61de55bd451a2323c44704f857cbad77e5111524a23"

        NCMB.initialize(activity, appKey, clientKey)
        val installation = NCMBInstallation.getCurrentInstallation()

        installation.getDeviceTokenInBackground { _, ex ->
            if (ex == null) {
                FirebaseMessaging.getInstance().token
                    .addOnCompleteListener { task ->
                        if (!task.isSuccessful) {
                            return@addOnCompleteListener
                        }

                        val token = task.result
                        if (token != null) {
                            installation.deviceToken = token
                        }

                        val channels = JSONArray().apply { put(userId) }
                        installation.channels = channels

                        installation.saveInBackground { e ->
                            if (e != null && e.code == "409001") {
                                try {
                                    val query = NCMBInstallation.getQuery()
                                    query.whereEqualTo("deviceToken", installation.deviceToken)
                                    val existing = query.find()[0].objectId
                                    installation.objectId = existing
                                    installation.saveInBackground { it?.printStackTrace() }
                                } catch (e2: NCMBException) {
                                    e2.printStackTrace()
                                }
                            }
                        }
                    }
            } else {
                ex.printStackTrace()
            }
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == NetWorkUtils.REQUEST_CODE_CONNECTION_NETWORK) {
            val result = NetWorkUtils.isNetworkAvailable(activity)
            mPromise?.let {
                if (result) it.resolve("true") else it.reject("false")
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // No-op
    }
}
