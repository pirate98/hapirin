package com.hapirin

import android.app.Dialog
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.util.DisplayMetrics
import android.view.WindowMetrics
import android.widget.ImageView
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "hapirin"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
      val dialog = Dialog(this, android.R.style.Theme_Translucent_NoTitleBar)
      val view = LayoutInflater.from(this).inflate(R.layout.dialog, null)
      val imageView = view.findViewById<ImageView>(R.id.splash)

      val metrics = DisplayMetrics()
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
          val windowMetrics: WindowMetrics = windowManager.currentWindowMetrics
          val bounds = windowMetrics.bounds
          metrics.widthPixels = bounds.width()
          metrics.heightPixels = bounds.height()
      } else {
          @Suppress("DEPRECATION")
          windowManager.defaultDisplay.getMetrics(metrics)
      }
      val height = metrics.heightPixels
      val width = metrics.widthPixels

      if (height.toFloat() / width >= 2f) {
          imageView.setImageResource(R.drawable.splash_18x9)
      }

      dialog.setContentView(view)
      dialog.show()

      Handler(Looper.getMainLooper()).postDelayed({
          dialog.dismiss()
      }, 3000)

      super.onCreate(savedInstanceState)
  }
}
